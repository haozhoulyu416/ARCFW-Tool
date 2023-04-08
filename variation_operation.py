from generation_utilities import *

# Variation Operation: Mutation, Crossover
# Mutation: one mutation change one action 
def mutation(solution):
    img_num = getImgNum()
    mutated_solution = Solution(img_num)
    mutated_solution = copy.deepcopy(solution)
    mutation_prob = random.random()
    if mutation_prob < 0.4:
        loc = random.randint(0,len(mutated_solution.actions) - 1)
        mutated_solution.actions[loc] = 1 if mutated_solution.actions[loc] == 0 else 0
        loc_img = random.randint(0, len(mutated_solution.actions_img) - 1)
        mutated_solution.actions_img[loc] = 1 if mutated_solution.actions_img[loc_img] == 0 else 0
    return mutated_solution

# Crossover: Return two new offspring after two parents crossover, exchange two actions with each other.
def crossover(solution_p1, solution_p2):
    img_num = getImgNum()
    parent1 = Solution(img_num)
    parent1 = copy.deepcopy(solution_p1)
    parent2 = Solution(img_num)
    parent2 = copy.deepcopy(solution_p2)
    crossover_prob = random.random()
    if crossover_prob < 0.7:
        loc1 = random.randint(0,len(parent1.actions) - 1)
        loc2 = random.randint(0,len(parent1.actions) - 1)
        parent1.actions[loc1], parent2.actions[loc1] = parent2.actions[loc1], parent1.actions[loc1]
        parent1.actions[loc2], parent2.actions[loc2] = parent2.actions[loc2], parent1.actions[loc2]
        parent1.actions_img[loc1], parent2.actions_img[loc1] = parent2.actions_img[loc1], parent1.actions_img[loc1]
        parent1.actions_img[loc2], parent2.actions_img[loc2] = parent2.actions_img[loc2], parent1.actions_img[loc2]
    return parent1, parent2