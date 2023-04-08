# Tournament select：
# Return the non_dominated front number of competitors of the parent
def find_front_index(non_dominated, p1, p2):
    f1_0, f2_0 = -1, -1
    f1_1, f2_1 = -1, -1
    for i, fn in enumerate(non_dominated):
        for j, value in enumerate(fn):
            if p1 == value:
                f1_0 = i
                f1_1 = j
            if p2 == value:
                f2_0 = i
                f2_1 = j
    return f1_0, f1_1, f2_0, f2_1

def tournament_select(non_dominated, crowding_distance, p1, p2):
    p1_0, p1_1, p2_0, p2_1 = find_front_index(non_dominated, p1, p2)
    cd1, cd2 = crowding_distance[p1_0][p1_1], crowding_distance[p2_0][p2_1]
    if((p1_0 < p2_0) or (p1_0 == p2_0 and cd1 >= cd2)):
        return p1
    else:
        return p2