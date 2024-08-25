<template>
  <div class="container-fluid">
    <div class="row">
      <div id="timeline-content">
        <!-- Loading Spinner -->
        <div
          v-if="loading"
          class="text-center my-4"
        >
          <div
            class="spinner-border text-primary"
            role="status"
          >
            <span class="visually-hidden">Loading...</span>
          </div>
          <p>Loading data, please wait...</p>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="alert alert-danger"
          role="alert"
        >
          <p>Error: {{ error }}</p>
        </div>

        <!-- Container for the timeline header and graph with scroll -->
        <div id="timeline-wrapper">
          <div id="timeline-header-container">
            <svg id="timeline-header" />
          </div>
          <div id="timeline-graph-container">
            <div id="timeline-scroll-container">
              <svg id="timeline-graph" />
            </div>
          </div>
        </div>
      </div>

      <ModalProfile
        ref="profileModal"
        class="px-0"
        :person="selectedPerson"
        :data-persons="dataPersons"
        @refresh-profile="refreshPersonProfile"
      />
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import debounce from 'lodash/debounce'

import fetchDataMixin from '@/mixins/fetchDataMixin'
import { fetchPersons } from '@/services/personsService.js'

import ModalProfile from './ModalProfile.vue'
import config from '../config'

export default {
  components: {
    ModalProfile
  },
  mixins: [fetchDataMixin],
  data () {
    return {
      selectedPerson: null,
      dataPersons: [],
      rootPersons: [],
      isDataLoaded: false,
      previousWidth: null,
      previousHeight: null,
      barHeight: 60,
      year_start: config.startYear || 1800,
      year_stop: config.endYear || 2050,
      viewStartYear: config.startViewYear || 1800,
      viewStopYear: config.endViewYear || 2050,
      defaultColor: '#e5e5e5',
      familyColorsMap: new Map(),
      paleColor: (color) => d3.interpolateRgb(color, '#ffffff')(0.7),
      colorScale: d3.scaleOrdinal(d3.schemePaired),
      displayedPersons: new Set(),
      initialPointerX: 0,
      initialTranslateX: 0,
      initialDomain: 0,
    }
  },
  async created () {
    this.dataPersons = await this.fetchData(fetchPersons)
    this.isDataLoaded = true
  },
  mounted () {
    window.addEventListener('resize', this.handleResize)
    this.$watch('isDataLoaded', (newValue) => {
      if (newValue) {
        this.drawTimeline()
      }
    })
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    filterRootPersons () {
      return this.dataPersons.filter(person => {
        return !person.relatives.some(relative =>
          relative.relation_type === 'father' || relative.relation_type === 'mother'
        )
      })
    },

    filterSpouses (personId) {
      // Find the person with the given personId
      const person = this.dataPersons.find(p => p.id === personId)

      // If the person is not found, return an empty array
      if (!person) {
        return []
      }

      // Extract the list of relatives
      const relatives = person.relatives || []

      // Filter the relatives to get only those with relation_type 'spouse'
      const spouses = relatives.filter(relative => relative.relation_type === 'spouse')

      // Get the full details of the spouses from the data list
      const spouseDetails = spouses.map(spouse => {
        // Find the full details of each spouse from the data
        const spouseDetail = this.dataPersons.find(p => p.id === spouse.id)

        // Initialize the common dates to null
        let marriageDate = null
        let divorceDate = null
        let civilUnionDate = null
        let civilSeparationDate = null

        // Find the events that match marriage, civil union, or divorce
        const commonEvents = person.events.filter(event => {
          return ['marriage', 'divorce', 'civil_union', 'civil_separation'].includes(event.event_type) &&
                event.related_persons.some(rp => rp.id === spouse.id)
        })

        // Extract the relevant dates from the common events
        commonEvents.forEach(event => {
          switch (event.event_type) {
            case 'marriage':
              marriageDate = event.event_date
              break
            case 'divorce':
              divorceDate = event.event_date
              break
            case 'civil_union':
              civilUnionDate = event.event_date
              break
            case 'civil_separation':
              civilSeparationDate = event.event_date
              break
          }
        })

        // Return the spouse detail with the added common dates
        return {
          ...spouseDetail,
          marriage_date: marriageDate,
          divorce_date: divorceDate,
          civil_union_date: civilUnionDate,
          civil_separation_date: civilSeparationDate
        }
      })

      // Return the list of spouse details
      return spouseDetails
    },

    filterChildren (personId, spouseId) {
      // Find the person with the given personId
      const person = this.dataPersons.find(p => p.id === personId)

      // If the person is not found, return an empty array
      if (!person) {
        return []
      }

      // Extract the list of relatives (children)
      const relatives = person.relatives || []

      // Filter the relatives to get only those with relation_type 'child'
      const children = relatives.filter(relative => relative.relation_type === 'child')

      // Get the full details of the children from the data list and filter by spouse
      const childrenDetails = children.map(child => {
        // Find the full details of each child from the data
        const childDetail = this.dataPersons.find(p => p.id === child.id)

        // Check if the child has both parents (personId and spouseId)
        const hasBothParents = childDetail.relatives.some(relative =>
          (relative.relation_type === 'father' && (relative.id === personId || relative.id === spouseId)) ||
          (relative.relation_type === 'mother' && (relative.id === personId || relative.id === spouseId))
        )

        // Return the child detail if both parents are found
        return hasBothParents ? childDetail : null
      }).filter(child => child !== null)

      // Return the list of children details
      return childrenDetails
    },

    filterOldestAncestor (personId) {
      // Find the person with the given ID
      const currentPerson = this.dataPersons.find(p => p.id === personId)

      // If the person is not found, return null
      if (!currentPerson) {
        return null
      }

      // Recursive function to find the oldest ancestor
      const findAncestor = (person) => {
        // Find the father and mother from the relatives
        const father = person.relatives.find(relative => relative.relation_type === 'father')
        const mother = person.relatives.find(relative => relative.relation_type === 'mother')

        // If both parents are missing, the current person is the oldest ancestor
        if (!father && !mother) {
          return person
        }

        // Prioritize the father if available, otherwise use the mother
        const parent = this.dataPersons.find(p => p.id === (father ? father.id : mother.id))

        // Continue climbing up the ancestor chain with the selected parent
        return findAncestor(parent)
      }

      // Find and return the oldest ancestor
      return findAncestor(currentPerson)
    },

    getYearFromDate (date) {
      return date ? new Date(date).getFullYear() : new Date().getFullYear()
    },

    getPeriods (person, familyColor = null, isChild = false) {
      // Extract birth and death years from the person object
      const birthYear = this.getYearFromDate(person.birth_date)
      const endYear = this.getYearFromDate(person.death_date)

      // Default verification status for birth and death dates
      const birthDateVerified = person.birth_date_verified !== null ? person.birth_date_verified : true
      const deathDateVerified = person.death_date_verified !== null ? person.death_date_verified : true

      // Get spouses
      const spouses = this.filterSpouses(person.id)

      // Initialize the periods array and the starting year
      const periods = []
      let lastEventYear = birthYear

      // Handle case where there are no spouses or children
      if (!spouses.length) {
        periods.push({
          start: birthYear,
          end: endYear,
          color: familyColor !== null ? familyColor : this.defaultColor,
          birthDateVerified,
          deathDateVerified,
          stillAlive: person.death_date === null
        })
        return periods
      }

      // Handle case where spouses exist
      for (const spouse of spouses) {
        let relationshipStartYear = null

        // Extract years for marriage, civil union, divorce, and separation
        const marriageYear = spouse.marriage_date ? new Date(spouse.marriage_date).getFullYear() : null
        const divorceYear = spouse.divorce_date ? new Date(spouse.divorce_date).getFullYear() : endYear
        const unionYear = spouse.civil_union_date ? new Date(spouse.civil_union_date).getFullYear() : null
        // const separationYear = spouse.civil_separation_date ? new Date(spouse.civil_separation_date).getFullYear() : endYear

        // Determine relationshipStartYear based on marriage, union, and children
        if (!marriageYear && !unionYear) {
          const children = this.filterChildren(person.id, spouse.id)
          if (children.length > 0) {
            relationshipStartYear = new Date(children[0].birth_date).getFullYear()
          }
        }

        // If relationshipStartYear is still null but unionYear or marriageYear exists
        relationshipStartYear = relationshipStartYear ?? unionYear
        relationshipStartYear = relationshipStartYear ?? marriageYear

        // If both relationshipStartYear and unionYear exist, choose the earliest year
        if (relationshipStartYear && unionYear) {
          relationshipStartYear = Math.min(relationshipStartYear, unionYear)
        }

        if (relationshipStartYear) {
          // Generate a unique family key by sorting the IDs and joining them
          const familyKey = this.getFamilyKey(person.id, spouse.id)

          // Retrieve or generate a color for this spouse
          let spouseColor = this.familyColorsMap.get(familyKey)
          if (!spouseColor) {
            spouseColor = this.paleColor(this.colorScale(spouse.id))
            this.familyColorsMap.set(familyKey, spouseColor)
          }

          // Add the period before the relationship started
          if (lastEventYear < relationshipStartYear) {
            periods.push({
              start: lastEventYear,
              end: relationshipStartYear,
              color: isChild ? familyColor : this.defaultColor,
              birthDateVerified,
              deathDateVerified,
              stillAlive: person.death_date === null
            })
          }

          // Add the period during the relationship
          periods.push({
            start: relationshipStartYear,
            end: divorceYear,
            color: spouseColor,
            birthDateVerified,
            deathDateVerified,
            stillAlive: person.death_date === null
          })

          // Update the last event year to the end of this relationship
          lastEventYear = divorceYear
        } else {
          // If no relationship start year is available, continue with the default color
          periods.push({
            start: lastEventYear,
            end: endYear,
            color: this.defaultColor,
            birthDateVerified,
            deathDateVerified,
            stillAlive: person.death_date === null
          })
        }
      }

      // Handle the period after the last divorce until death or the current year
      if (lastEventYear < endYear) {
        periods.push({
          start: lastEventYear,
          end: endYear,
          color: this.defaultColor,
          birthDateVerified,
          deathDateVerified
        })
      }
      return periods
    },

    getFamilyKey (personId, spouseId) {
      // Generate a unique family key by sorting the IDs and joining them
      return [personId, spouseId].sort().join('-')
    },

    handleResize: debounce(function () {
      this.isSmallScreen = window.innerWidth < 768

      const width = window.innerWidth
      const height = window.innerHeight
      if (width !== this.previousWidth || height !== this.previousHeight) {
        this.previousWidth = width
        this.previousHeight = height
        this.drawTimeline()
      }
    }, 300),

    setupSvg () {
      const margin = { top: 20, right: 20, left: 20 }
      // Get the width of the 'timeline-content' element
      const timelineContent = document.getElementById('timeline-content')
      const timelineContentWidth = timelineContent
         ? parseFloat(window.getComputedStyle(timelineContent).width)
         : window.innerWidth

      // Calculate the available width for the timeline chart
      const timelineWidth = timelineContentWidth - margin.right - margin.left

      // Calculate the total height of the chart
      const totalHeight = Math.max((this.dataPersons.length + 1) * this.barHeight, window.innerHeight)

      //const xScale = d3.scaleLinear()
      //  .domain([this.year_start, this.year_stop])
      //  .range([0, timelineWidth])

      const xViewScale = d3.scaleLinear()
        .domain([this.viewStartYear, this.viewStopYear])
        .range([0, timelineWidth]);

      const svg = d3.select('#timeline-graph')
        .attr('width', timelineWidth)
        .attr('height', totalHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)

      // add blur filter
      const defs = svg.append('defs')
      const filterBlur = defs.append('filter')
        .attr('id', 'blur-filter')
        .attr('x', '-50%') // Extend the filter area to the left
        .attr('y', '0')
        .attr('width', '200%') // Ensure the blur affects enough area
        .attr('height', '100%')
      filterBlur.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', '6') // Adjust the blur amount

        d3.select('#timeline-graph-container')
          .call(d3.drag()
            .on('start', (event) => this.onDragStart(event, svg, xViewScale))
            .on('drag', (event) => this.onDrag(event, svg, xViewScale, timelineWidth))
          );

      return { svg, xViewScale, timelineWidth, totalHeight, margin }
    },

    onDragStart(event, svg, xViewScale) {
      // Get the current transform attribute
      const transformAttr = svg.attr('transform') || 'translate(0,0)';

      // Extract the current x translation from the transform attribute
      this.initialTranslateX = parseFloat(transformAttr.split('translate(')[1].split(',')[0]) || 0;

      // Store the initial pointer x-coordinate and domain
      this.initialPointerX = d3.pointer(event)[0];
      this.initialDomain = xViewScale.domain();
    }, 

    onDrag(event, svg, xViewScale, timelineWidth) {
      // Get the current x-coordinate of the cursor
      const currentPointerX = d3.pointer(event)[0];

      // Calculate the change in x position
      const dx = currentPointerX - this.initialPointerX;

      // Calculate the corresponding shift in years
      const domainShift = dx * (this.initialDomain[1] - this.initialDomain[0]) / timelineWidth;

      // Calculate the new domain based on the shift
      let newDomainStart = this.initialDomain[0] - domainShift;
      let newDomainEnd = this.initialDomain[1] - domainShift;

      if (newDomainStart < this.year_start-5 || newDomainEnd > this.year_stop+5) {
        return
      }

      // Move the svg group accordingly
      const newTranslateX = this.initialTranslateX + dx;
      svg.attr('transform', `translate(${newTranslateX}, 0)`);

      // Update the xViewScale domain
      xViewScale.domain([newDomainStart, newDomainEnd]);

      // Update the header with the new domain
      this.updateTimelineHeader([newDomainStart, newDomainEnd]);

      // Update initial values for the next drag event
      this.initialPointerX = currentPointerX;
      this.initialTranslateX = newTranslateX;
      this.initialDomain = [newDomainStart, newDomainEnd];
      this.viewStartYear = newDomainStart;
      this.viewStopYear = newDomainEnd;
    },

    updateTimelineHeader(newDomain) {
      const width = parseFloat(d3.select('#timeline-header').attr('width'));
      const margin = { top: 20, left: 20 }; // Update with actual margins if different
      
      // Clear existing header content
      d3.select('#timeline-header').html('');
      
      // Create new header with updated domain
      this.drawTimelineHeader(width, margin, newDomain[0], newDomain[1]);
    },

    clearTimeline () {
      // Clear existing content
      d3.select('#timeline-header').html('')
      d3.select('#timeline-graph').html('')

      // Clear some variables
      this.displayedPersons.clear()
      this.familyColorsMap.clear()
    },

    drawTimeline () {
      // Clear existing content
      this.clearTimeline()

      // Set up SVG dimensions and scales
      const { svg, xViewScale, timelineWidth, totalHeight, margin } = this.setupSvg()

      // Draw header
      this.drawTimelineHeader(timelineWidth, margin, this.viewStartYear, this.viewStopYear)

      // draw background
      this.drawTimelineBackground(svg, xViewScale, this.year_start, this.year_stop, totalHeight, margin)

      // Draw persons and their periods
      this.drawPersons(svg, xViewScale)
    },

    drawTimelineHeader (width, margin, yearStart, yearStop) {
      const timelineHeader = d3.select('#timeline-header')
        .attr('width', width)
        .attr('height', 30)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      const xScale = d3.scaleLinear()
        .domain([yearStart, yearStop])
        .range([0, width])

      const xAxis = d3.axisTop(xScale).tickFormat(d3.format('d'))

      timelineHeader.append('g')
        .attr('class', 'x axis')
        .call(xAxis)
        .attr('transform', 'translate(0, 0)')
    },

    drawTimelineBackground (svg, xScale, yearStart, yearStop, height, margin) {
      // Create a scale for vertical lines every xx years
      const intervalYears = 5;
      const xAxisTicks = d3.axisTop(xScale)
        .tickFormat('')
        .tickSize(-(height + margin.top))
        .tickValues(d3.range(yearStart, yearStop+intervalYears, intervalYears))

      // Add a group for the vertical lines
      const xAxisTicksGroup = svg.append('g')
        .call(xAxisTicks)

      // remove border
      xAxisTicksGroup.select('path').remove();

      // Modify the style of the vertical lines
      xAxisTicksGroup.selectAll('line')
        .attr('stroke', '#ccc')
        .attr('stroke-dasharray', '1,1');

    },

    drawRoundedRect (x, y, width, height, radius, roundLeft, roundRight) {
      let path = `M${x + (roundLeft ? radius : 0)},${y}`

      if (roundRight) {
        path += `H${x + width - radius}`
        path += `A${radius},${radius} 0 0 1 ${x + width},${y + radius}`
      } else {
        path += `H${x + width}`
      }

      path += `V${y + height - (roundRight ? radius : 0)}`

      if (roundRight) {
        path += `A${radius},${radius} 0 0 1 ${x + width - radius},${y + height}`
      }
      path += `H${x + (roundLeft ? radius : 0)}`

      if (roundLeft) {
        path += `A${radius},${radius} 0 0 1 ${x},${y + height - radius}`
      }
      path += `V${y + (roundLeft ? radius : 0)}`

      if (roundLeft) {
        path += `A${radius},${radius} 0 0 1 ${x + radius},${y}`
      }

      path += 'Z'

      return path
    },

    drawPersons (svg, xScale) {
      let yPosition = 0
      const familyColor = null
      const isChild = false

      this.rootPersons = this.filterRootPersons()
      for (const person of this.rootPersons) {
        if (!this.displayedPersons.has(person.id)) {
          const personPeriods = this.getPeriods(person, familyColor, isChild)
          yPosition = this.drawPerson(person, personPeriods, svg, yPosition, xScale)
          yPosition++
        }
      }
    },

    drawPerson (person, periods, svg, yPosition, xScale) {
      if (this.displayedPersons.has(person.id)) { return yPosition }

      // Extract birth and death years from the person object
      const birthYear = this.getYearFromDate(person.birth_date)

      // Draw each period as a segment of the timeline
      const y = yPosition * this.barHeight / 2 + 10
      const height = 40
      const personGroup = svg.append('g')
        .attr('class', 'person')
      // .attr("data-id", person.id)
        .attr('transform', `translate(0, ${y})`)
        .datum(person)

      // Create a timeline group for all periods
      const periodsGroup = personGroup.append('g')

      // draw each period for this person
      periods.forEach((period, index) => {
        const x = xScale(period.start)
        const width = xScale(period.end) - xScale(period.start)
        const roundLeft = index === 0
        const roundRight = (index === periods.length - 1) && !period.stillAlive

        // Determine the filter to apply
        let filter = 'none'
        if (!period.birthDateVerified || !period.deathDateVerified) {
          filter = 'url(#blur-filter)'
        }

        periodsGroup.append('path')
          .attr('d', this.drawRoundedRect(x, y, width, height, 10, roundLeft, roundRight))
          .attr('fill', period.color)
          .style('cursor', 'pointer')
          .style('filter', filter)
          .on('click', () => this.showPersonProfile(person))
      })

      // Determine the image URL based on gender
      const imageUrl = person.gender === 'Male'
        ? 'profile_men.png'
        : 'profile_women.png'

      // Append the image inside the circle
      personGroup.append('image')
        .attr('xlink:href', imageUrl)
        .attr('x', xScale(birthYear) + 10)
        .attr('y', y + height / 2 - 15)
        .attr('fill', 'none')
        .attr('width', 30)
        .attr('height', 30)
        .attr('clip-path', 'circle(15px at 15px 15px)')
        .style('cursor', 'pointer')
        .on('click', () => this.showPersonProfile(person))

      // // Add the person's name on the bar
      personGroup.append('text')
        .attr('x', xScale(birthYear) + 45)
        .attr('y', y + height / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'start')
        .text(`${person.first_name} ${person.last_name}`)
        .style('cursor', 'pointer')
        .style('user-select', 'none')
        .on('click', () => this.showPersonProfile(person))

      // set this person as displayed to avoid duplication
      this.displayedPersons.add(person.id)

      // draw other associated persons
      const spouses = this.filterSpouses(person.id)
      for (const spouse of spouses) {
        const familyColor = this.familyColorsMap.get(this.getFamilyKey(person.id, spouse.id))
        let isChild = false

        // draw oldest anceter
        const oldestAncestor = this.filterOldestAncestor(spouse.id)
        if (oldestAncestor.id !== spouse.id) {
          if (!this.displayedPersons.has(oldestAncestor.id)) {
            const oldestAncestorPeriods = this.getPeriods(oldestAncestor, familyColor, isChild)
            yPosition = this.drawPerson(oldestAncestor, oldestAncestorPeriods, svg, yPosition + 1, xScale)
          }
        }

        // draw the spouse
        if (!this.displayedPersons.has(spouse.id)) {
          const spousePeriods = this.getPeriods(spouse, familyColor, isChild)
          yPosition = this.drawPerson(spouse, spousePeriods, svg, yPosition + 1, xScale)
        }

        // draw children
        const children = this.filterChildren(person.id, spouse.id)
        for (const child of children) {
          if (!this.displayedPersons.has(child.id)) {
            isChild = true
            const childPeriods = this.getPeriods(child, familyColor, isChild)
            yPosition = this.drawPerson(child, childPeriods, svg, yPosition + 1, xScale)
          }
        }
      }
      return yPosition
    },

    showPersonProfile (person) {
      this.selectedPerson = person
      this.$refs.profileModal.show()
    },

    refreshPersonProfile (person) {
      this.selectedPerson = person
    }

  }
}
</script>

<style>
#timeline-content {
  margin-top: 56px;
  padding: 0;
  height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
}

#timeline-wrapper {
  height: 100%;
  overflow: auto;
  position: relative;
}

#timeline-header-container {
  position: sticky;
  top: 0;
  height: 40px;
  width: 100%;
  background-color: white;
  z-index: 10;
}

#timeline-header {
  width: 100%;
  height: 100%;
}

#timeline-graph-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
}

#timeline-graph {
  width: 100%;
}

.vertical-bar-group .vertical-bar {
  stroke: grey;
}

.vertical-bar-group:hover .vertical-bar {
  stroke: #0056b3;
}

.person {
    font-size: 12px;
    fill: #333;
    transition: filter 0,5s ease-in-out;
}

.person:hover {
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.2));
  font-weight: 600;
}

.person text {
    font-size: 14px;
    fill: rgb(68, 68, 68);

}
</style>
