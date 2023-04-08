from generation_utilities_DNT import *
from crowding_distance import *
from non_dominated_sort import *
from tournament_selection import *
from variation_operation import *
from get_carbon_grams import *
import json

# Main part: Initialization V5.0 加入了锦标赛选择, 三个fitness functions：
# 1.Transferred data bytes 2.Page load time 3.Number of changes
start = time.time()

print("******************** Populatoin Initialization ********************")
with open('parasettings.json','r',encoding='utf-8') as f:
    data = json.load(f)
pop_size = data['POP_SIZE']
max_gen = data['MAX_GEN']
population = creation_population(pop_size)
gen_no = 0

pop_arrays = [[]]
best_fitness_value_transferred_data = []
best_fitness_value_ram = []
best_fitness_value_change_number = []

while(gen_no < max_gen):
    print("******************** Generation is ", gen_no, "********************")
    print("\n")
    front_count = 0
    function1_values = [population[i].fitness_transferred_data for i in range(0, pop_size)]
    function2_values = [population[i].fitness_ram for i in range(0, pop_size)]
    function3_values = [population[i].fitness_change_number for i in range(0, pop_size)]
    non_dominated_sorted_solution = fast_non_dominated_sort_new(function1_values[:], function2_values[:], function3_values[:])
    print("The best front actions combination ",gen_no, " is")
    for valuez in non_dominated_sorted_solution[0]:
        print(population[valuez].actions, end = " ")
        print(population[valuez].actions_img, end = "")
        front_count += 1
    print(front_count)
    print("\n")
    crowding_distance_values = []
    for i in range(0,len(non_dominated_sorted_solution)):
        crowding_distance_values.append(crowding_distance_new(function1_values[:],function2_values[:],function3_values[:],non_dominated_sorted_solution[i][:]))
   
    # If this is the last generation, break here, do not need to generate new offsprings:
    # Write the best solution to file:
    if(gen_no == max_gen - 1):
        pop_arrays = non_dominated_sorted_solution
       
        print(non_dominated_sorted_solution)
        best_solutions = []
        best_solutions_actions = []
        best_solutions_actions_img = []
        best_solutions_fitness_transferred_data = []
        for valuez in non_dominated_sorted_solution[0]:
            best_solutions.append(population[valuez])
            best_solutions_actions.append(population[valuez].actions)
            best_solutions_actions_img.append(population[valuez].actions_img)
            best_solutions_fitness_transferred_data.append(population[valuez].fitness_transferred_data)
            print("The best actions combinations are: ")
            print("\n")
            print(population[valuez].actions, end = " ")
            print(population[valuez].actions_img, end = " ")
            print(population[valuez].fitness_transferred_data, end = " ")
            print(population[valuez].fitness_ram, end = " ")
            print(population[valuez].fitness_change_number, end = " ")
            print("\n")
            best_fitness_value_transferred_data.append(population[valuez].fitness_transferred_data)
            best_fitness_value_ram.append(population[valuez].fitness_ram)
            best_fitness_value_change_number.append(population[valuez].fitness_change_number)
        sort = sort_by_values(non_dominated_sorted_solution[0], best_solutions_fitness_transferred_data[:])
        print("Best solution is: ")
        print("\n")
        print(best_solutions_actions[sort[0]], end = " ")
        print(best_solutions_actions_img[sort[0]], end = " ")
        print(best_solutions_fitness_transferred_data[sort[0]], 'KB', end = " ")
        print(getCarbonGrams(best_solutions_fitness_transferred_data[sort[0]]), 'g', end = " ")
        break
        
    # Generate offsprings:
    population2 = population[:]
    while(len(population2) <= 2 * pop_size):
        # Add Tournament selection: select the quite good p1, p2, then use p1, p2 to create the offspring1, offspring2
        a1, b1 = random.randint(0,pop_size-1), random.randint(0,pop_size-1)
        a2, b2 = random.randint(0,pop_size-1), random.randint(0,pop_size-1)
        p1 = tournament_select(non_dominated_sorted_solution, crowding_distance_values, a1, b1)
        p2 = tournament_select(non_dominated_sorted_solution, crowding_distance_values, a2, b2) 
        
        offspring1, offspring2 = crossover(mutation(population[p1]), mutation(population[p2]))
        new_offspring1 = generateOffIndiv(offspring1)
        new_offspring2 = generateOffIndiv(offspring2)
        print("Have produced new offsprings!")
        print(new_offspring1.actions)
        print(new_offspring2.actions)
        population2.append(new_offspring1) 
        population2.append(new_offspring2)
        
    # Have gotten the new combination of offspring and parents: population2 and then do non dominated sort and crowding distance sort
    function1_values2 = [population2[i].fitness_transferred_data for i in range(0, pop_size * 2)]
    function2_values2 = [population2[i].fitness_ram for i in range(0, pop_size * 2)]
    function3_values2 = [population2[i].fitness_change_number for i in range(0, pop_size * 2)]
    non_dominated_sorted_solution2 = fast_non_dominated_sort_new(function1_values2[:],function2_values2[:],function3_values2[:])
    crowding_distance_values2 = []
    for i in range(0, len(non_dominated_sorted_solution2)):
        crowding_distance_values2.append(crowding_distance_new(function1_values2[:],function2_values2[:],function3_values2[:],non_dominated_sorted_solution2[i][:]))
    
    new_population = []
    for i in range(0, len(non_dominated_sorted_solution2)):
        non_dominated_sorted_solution2_1 = [index_of(non_dominated_sorted_solution2[i][j],non_dominated_sorted_solution2[i] ) 
                                            for j in range(0,len(non_dominated_sorted_solution2[i]))]
        front22 = sort_by_values(non_dominated_sorted_solution2_1[:], crowding_distance_values2[i][:])
        front = [non_dominated_sorted_solution2[i][front22[j]] for j in range(0,len(non_dominated_sorted_solution2[i]))]
        front.reverse()
        
        for value in front:
            new_population.append(value)
            if(len(new_population) == pop_size):
                break
        if(len(new_population) == pop_size):
            break
    population = [population2[i] for i in new_population]
    gen_no += 1
    print("Go to next generation!")

end = time.time()
print(end-start, 's')