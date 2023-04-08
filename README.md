# Exploring-Automated-Reduction-of-the-Carbon-Footprint-of-Webpages - Automated Carbon Footprint Reduction Tool
Project "Exploring Automated Reduction of the Carbon Footprint of Webpages" - Automated Carbon Footprint Reduction Tool's source code.
This is a prototype of automated generation framework for web projects. This prototype generates new modified web files using random approach.

# Guidance
## Installation
### Environment Configuration

* Python : 3.10
* Node: v16.18
* Google Chrome: v111.0
* Selenium: 4.6
* Psutil: 5.9

Install Python dependencies:
`pip install -r requirements.txt `

## Usage
### Settings
The following parameters for the Automatic carbon footprint reduction tool in `parasettings.py` should be set.
* `FILE_PATH`: The absolute address of the website file.
* `PAGE_URL`: The URL of the homepage in the website file.
* `POP_SIZE`: The initial population size of the NSGA-II model.
* `MAX_GEN`: The max generation of the NSGA-II model.

### Start running prototype
`python random_generation_tool.py`

### Main files
* `actions_taken.js`: Contains the functions to reduce the carbon footprint value of web project.
* `get_data_transferred.js`: Use the Lighouthouse tool to get the data byte weight and page load time.
* `crowding_distance.py`: Funtion to calculate crowding distance.
* `non_dominated_sort.py`: Function to carry out NSGA-II algorihtm's fast non dominated sorting.
* `tournament_selection.py`: Function to run the tournament selection for the offspring production.
* `variation_operation.py`: Functions for variation, mutation, and crossover operation.
* `generation_utilities_DNR.py`: Fitness functions and population creation functions for the fitness function combination DNR, etc.
* `generation_utilities_DNT.py`: Fitness functions and population creation functions for the fitness function combination DNT, etc.
* `get_carbon_grams.py`: Convert the transferred data to carbon with the unit of gram.
* `random_generation_tool_DNR.py`: The main file of the random generation tool with the fitness functions of [Quantity of transferred data + Number of changes + RAM]
* `random_generation_tool_DNT.py`: The main file of the random generation tool with the fitness functions of [Quantity of transferred data + Number of changes + Pgae load time]



### Limitations
This prototype performs best:
The home page of the website is named “index.html”

## Output
Output content:
* `Fitness Value_Quantity of transferred data` : Return the fitness value of quantitiy of transferred data.
* `Fitness Value_The number of changes` : Return the fitness value of the number of changes.
* `Fitness Value_Page load time` : Return the fitness value of the page load time.
* `Fitness Value_RAM` : Return the fitness value of the RAM.
* `Change actions taken` : Return the array of modified actions.
* `Carbon Footprint Value` : Return the final value of the carbon footprint score.
* `Paerto Fronts` : Return the pareto fronts arrays.
