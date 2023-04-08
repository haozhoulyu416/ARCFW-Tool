# Get carbon grams based on total transferred data bytes
def getCarbonGrams(databytes):
    RETURNING_VISITOR_PERCENTAGE = 0.25
    FIRST_TIME_VISITOR_PERCENTAGE = 0.75
    PERCENTAGE_OF_DATA_LOADED_ON_SUBSEQUENT_LOAD = 0.02
    KWH_PER_GB = 0.81
    CARBON_PER_KWG_GRID = 442
    MONTHLY_VIEWS_STAT = 10000
    
    adjustDataTransfer = databytes * FIRST_TIME_VISITOR_PERCENTAGE + databytes * RETURNING_VISITOR_PERCENTAGE * PERCENTAGE_OF_DATA_LOADED_ON_SUBSEQUENT_LOAD
    energyConsumption = adjustDataTransfer * KWH_PER_GB/ (1024*1024*1024)
    co2Grid = energyConsumption * CARBON_PER_KWG_GRID
    
    return co2Grid    