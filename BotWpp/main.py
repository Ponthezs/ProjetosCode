from selenium import webdriver
import time

class WhatappBot:
    def _init_(self):
        self.mensagem = "Amor eu te amo muito, você me faz feliz com coisas simples na minha vida, e por isso que eu te amo! eu acho que hoje em dia não sei oque seria sem você!"
        
        self.grupos = ["Central de reclamação ❤️💍."]
        options = webdriver.Chrome()
        options.add_argument('lang=pt-br')
        self.driver = webdriver.Chrome(executable_path=r'./chromedriver.exe')
        
        
    def EnviarMensagens(self):
        # <span dir="auto" title="Central de reclamação ❤️💍." aria-label="" class="ggj6brxn gfz4du6o r7fjleex g0rxnol2 lhj4utae le5p0ye3 l7jjieqr _11JPr"><span class="matched-text _11JPr">Central</span>
        #<div tabindex="-1" class="_3Uu1_">
        #<span data-testid="send" data-icon="send" class="">
        for grupo in self.grupos:
            grupo = self.driver.find_element_by_xpath(f"//span[@title='{grupo}']")
    
        