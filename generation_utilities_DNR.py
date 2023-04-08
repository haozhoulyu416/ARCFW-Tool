import math
import random
import matplotlib.pyplot as plt
import execjs
import time
from codecarbon import track_emissions
from codecarbon import EmissionsTracker
import os
import json
import copy
import subprocess
import json
import sys
import psutil
from datetime import datetime
from pprint import pprint as pp

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options as ChromeOption
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from codecarbon import EmissionsTracker


# Class that represents a solution. Constains a code block and a fitness score
# actions: the array to show 7 actions, they are 
# "Change image format", "Compress image", "Change HTML tag", "Remove unused CSS", "Remove effect property" "Move JavaScript to the bottom", "Add script tag"
class Solution:
    actions = [0 for i in range(6)]
    actions_img = []
    url = 'http://localhost:8080/exp1/ExpWebProj01/Poke-Dex-master/index_out.html'
    fitness_transferred_data = -1
    fitness_page_load_time = -1
    fitness_ram = -1
    fitness_change_number = -1
    
    def __init__(self, imgnum):
        self.actions = [0 for i in range(6)]
        self.actions_img = []
        self.url = 'http://localhost:8080/exp1/ExpWebProj01/Poke-Dex-master/index_out.html'
        self.fitness_transferred_data = -1
        self.fitness_page_load_time = -1
        self.fitness_ram = -1
        self.fitness_change_number = -1
        self.imgnum = imgnum

# Fitness function for calculating 1.transferred data bytes and 2.time to interative,
# return a new solution object with new transferred data bytes and new page load time
def fitness_function_transferred_data_and_load_time(solution, img_num):
    new_solution = Solution(img_num)
    new_solution = copy.deepcopy(solution)  
    start = time.time()
    f = subprocess.call(r"node get_data_transferred.js")
    if f == 0:
        print("Execute Nodejs getTotalByte.js successfully!")
    else:
        print("Cannot execute Nodejs getTotalByte.js!")
    end = time.time()
    print("Fitness Transferred data bytes and page load time", (end-start), 's')
    infile = r'carbon_data.json'
    with open(infile, 'r') as td_file:
        info = json.load(td_file)
        print(info)
        new_solution.fitness_transferred_data = info["total_byte_weight"]
        new_solution.fitness_page_load_time = info["time_to_interactive"]
    return new_solution

# Use Selenium and psutil to identify the RAM usage of webpage
# Return the chrome wbepage memory usage with the unit of KiB

class webSelenium():
    def webInit(self) -> None:
        self.driver = webdriver.Chrome()
        self.driver.delete_all_cookies()
        infile = r'newsolution_data.json'
        with open(infile, 'r') as file:
            url = json.load(file)["pageurl"]
        self.driver.get(url)
#         self.driver.get("http://localhost:8080/exp1/company-main/index.html")
        print("Start finish!")

    def webClose(self) -> None:
        self.driver.quit()
        print("Close!")

    def webOperation(self) -> None:
        js = "window.scrollTo(0, document.body.scrollHeight)"
        self.driver.execute_script(js)
        print("Sroll down!")
        js = "window.scrollTo(0, 0)"
        self.driver.execute_script(js)
        print("Scroll up!")

        time.sleep(1)
        nav_elements = self.driver.find_element(By.XPATH, "//*[@id='feature_tab']")
        elements = self.driver.find_elements(By.TAG_NAME, 'input')
        elements[0].clear()
        elements[1].clear() 
        elements[2].clear()
        elements[0].send_keys('Haozhou')
        elements[1].send_keys('haozhoulyu@gmail.com')
        elements[2].send_keys('764318872')
        elements[3].click()
        element_text = self.driver.find_elements(By.TAG_NAME, 'textarea')
        element_text[0].clear()
        element_text[0].send_keys('Answer')
        print("Fill in!")

def get_process_list(process_name):
    # 获取所有正在运行的进程PID
    pid_list = psutil.pids()
    process_list = []
    for pid in pid_list:
        try:
            pid_process = psutil.Process(pid)
        except Exception as e:
            continue
        pid_name = pid_process.name()
        if process_name == pid_name:
            process_list.append(pid_process)
    return process_list

# 获取 Chrome 进程 RAM
def get_RAM():
    start = time.time()
    iteration = 1
    chrome_cpu_percent = 0
    chrome_mem_uss = 0
    for i in range(iteration):
        webtest = webSelenium()
        webtest.webInit()
        process_list = get_process_list("chrome.exe")
#         time.sleep(1)
        print("The number of PID: ", len(process_list))
        for pid_process in process_list:
            print(pid_process)
            # 获取 RAM memory, USS(唯一集大小)是进程专有的内存
            process_list_temp = get_process_list("chrome.exe")
            if pid_process in process_list_temp:
                chrome_mem_uss += pid_process.memory_full_info().uss
                pid_process.cpu_percent(None)
                [webtest.webOperation() for _ in range(1)]
        webtest.webClose()
    avg_chrome_mem_uss = (round(chrome_mem_uss/ 1024/ iteration, 2))
    print("RAM: ",avg_chrome_mem_uss)
    end = time.time()
    print("RAM consumes: ", (end-start), 's')
    return avg_chrome_mem_uss    

# Fitness function for getting the 3.RAM of webpage,
# return a new solution object with new ram
def fitness_function_ram(solution):
    img_num = getImgNum()
    new_solution = Solution(img_num)
    new_solution = copy.deepcopy(solution)
    new_solution.fitness_ram = get_RAM()
    return new_solution

# Fitness functions for getting 4.the number of changes
# return a new solution object with new number of changes
def fitness_function_change_number(solution):
    img_num = getImgNum()
    new_solution = Solution(img_num)
    new_solution = copy.deepcopy(solution)
    actions = new_solution.actions
    actions_img = new_solution.actions_img
    count = 0
    for i in range(len(actions) - 2):
        if(actions[i] == 1):
            count = count + 1
    if(actions[len(actions) - 1] == 1 or actions[len(actions) - 2] == 1):
        for j in actions_img:
            if(j == 1):
                count = count + 1
    new_solution.fitness_change_number = count
    return new_solution

# Individual and Population Initialization
# Initialize the solution.actions randomly
# Add an parameter: img_num represnets the number of img tags included in the HTML file, that is, the number of images.
# Added reading of the img_count.json file to obtain the number of image files, img_num.
def create_random_initial_individual(img_num):
    new_solution = Solution(img_num)
    new_actions = []
    new_actions_img = []
    for i in range(6):
        new_actions.append(random.randint(0,1))
    new_solution.actions = new_actions
    for i in range(img_num):
        new_actions_img.append(random.randint(0,1))
    new_solution.actions_img = new_actions_img
    with open('parasettings.json','r',encoding='utf-8') as f:
        data = json.load(f)
    new_solution.url = data['PAGE_URL']
    return new_solution

# 把 HTML 文件中 img 的数量传送到 json 文件
def sendImgNum():
    f = subprocess.call(r'node "actions_taken.js"')
    if f == 0:
        print("Send Img number into JSON successfully!")
    else:
        print("Cannot send Img number into JSON!")

# 从 img_count.json 获取 img_num 
def getImgNum():
    infile = r'img_count.json'
    with open(infile, 'r') as td_file:
        img_num = json.load(td_file)
        print("Get Img number:", img_num)
        return img_num
    
# Execute the node.js file for actions.
def exeSoluActions():
    # 这里只能在和 js 文件同目录下才能运行 node js
    f = subprocess.call(r'node "actions_taken.js"')
    if f == 0:
        print("Execute Nodejs actions change successfully!")
    else:
        print("Cannot execute Nodejs actions change functions!")

# Send the solution's url, actions and actions_img to the json file
def writeIntoJson(solution):
    url = solution.url
    actions = solution.actions
    actions_img = solution.actions_img
    new_dict = {"pageurl": url, "actions": actions, "actions_img": actions_img}
    with open(r"newsolution_data.json","w+") as f:
        json.dump(new_dict,f)
    print("Write solution info into JSON!")

# Create an initial population of solution:
# 添加了一行 sendImgNum() 函数调用，来执行获取webpage的img数量并传送到json文件中
def creation_population(size):
    population = []
    sendImgNum()
    img_num = getImgNum()
    for i in range(size):
        # Create an complete individual in the following steps:
        new_solution = create_random_initial_individual(img_num)
        writeIntoJson(new_solution)
        exeSoluActions()
        # 需要一点延迟等待localhost更新
        time.sleep(3)
        new_solution_1 = fitness_function_transferred_data_and_load_time(new_solution, img_num)
        new_solution_2 = fitness_function_change_number(new_solution_1)
        new_solution_3 = fitness_function_ram(new_solution_2)
        population.append(new_solution_3)
    return population

# Genreate offspring individual 根据solution.actions and actions_img去完善solution的fitness value
def generateOffIndiv(solution):
    img_num = getImgNum()
    new_solution = Solution(img_num)
    new_solution = copy.deepcopy(solution)
    writeIntoJson(new_solution)
    exeSoluActions()
    time.sleep(3)
    new_solution_1 = fitness_function_transferred_data_and_load_time(new_solution, img_num)
    new_solution_2 = fitness_function_change_number(new_solution_1)
    new_solution_3 = fitness_function_ram(new_solution_2)
    return new_solution_3