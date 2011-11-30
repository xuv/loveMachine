#!/usr/local/bin/python
# -*- coding: utf-8 -*-

#    [loveMachine] = automatic facebook like processor
#    Copyright (C) 2011  Julien "juego" Deswaef
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.

### Config
# Facebook credentials
LOGIN = ""
PASSWORD = ""
# 
LIKE_PATH = "//ul[@id='home_stream']//button[@name='like']"
# For testing purposes
SIMULATE = 0
PAGE_USERNAME = ""


from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import WebDriverException
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import StaleElementReferenceException
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
import time
import sys

### Functions
def wait_and_find_element( webdriver, xpath, t):
	webdriver.switch_to_default_content() # To prevent getWindow null error
	try:
		WebDriverWait(webdriver, t).until(lambda x: x.find_element_by_xpath(xpath))
		return driver.find_element_by_xpath(xpath)
	except TimeoutException:
		print "TIMEOUT: no element @: " + xpath
		return 0
	except:
		print "ERROR on find element: ", sys.exc_info()
		return 0
	

def wait_and_find_elements( webdriver, xpath, t):
	webdriver.switch_to_default_content() # To prevent getWindow null error
	try:
		WebDriverWait(webdriver, t).until(lambda x: x.find_elements_by_xpath(xpath))
		return driver.find_elements_by_xpath(xpath)
	except TimeoutException:
		print "TIMEOUT: no elements @: " + xpath
		return 0
	except:
		print "ERROR on find elements: ", sys.exc_info()
		return 0

def logIn(webdriver, login, password):
	email_el = webdriver.find_element_by_name("email")
	pass_el =  webdriver.find_element_by_name("pass")
	email_el.send_keys(login)
	pass_el.send_keys(password.decode("utf-8"))
	webdriver.find_element_by_xpath("//form[@id='login_form']//input[@type='submit']").click()
	current_url = webdriver.current_url
	print "url: " + current_url
	if "login.php" in current_url:
		print "Wrong login and/or password"
		return 0
	else:
		print "Succesfully logged in"
		return 1
	
def logOut(webdriver):
	webdriver.find_element_by_xpath("//div[@class='menuPulldown']").click()
	webdriver.find_element_by_xpath("//input[@value='Log Out']").click()

def askForLoginAndPassword():
	LOGIN = raw_input("Facebook login: ")
	while LOGIN == "":
		LOGIN = raw_input("Facebook login: ")
	PASSWORD = raw_input("Password: ")
	while PASSWORD == "":
		PASSWORD = raw_input("Password: ")
	return LOGIN, PASSWORD
		
def strTime(totaltime):
	t = ""
	m = int(totaltime/60) 
	s = int(totaltime%60)
	if m != 0:
		t += str(m)+"m"
	t += str(s)+"s"
	return t 

def getAvailableLikes(webdriver, likePath):
	list = wait_and_find_elements(webdriver, likePath, 2)
	available = []
	if list != 0:
		for el in list:
			if el.is_enabled() and el.is_displayed():
				available.append(el)
			else:
				print "Ignored: " + el.id 
	print str(len(available)) + " likes available"
	return available

def updateUserStatus(webdriver, text):
	# Update status
	webdriver.find_element_by_xpath("//span[@id='composerTourStart']").click()
	status = webdriver.find_element_by_name("xhpc_message_text")
	status.send_keys(text.decode("utf-8"))  # with the help from  http://themoritzfamily.com/python-encodings-and-unicode.html
	#time.sleep(1)
	#status.send_keys(Keys.ENTER)
	try: 
		wait_and_find_element(webdriver, "//form[@class='attachmentForm']//input[@type='submit']", 5).click()
	except:
		print "Could not click on the Post button"
	
def updatePageStatus(webdriver, text):
	wait_and_find_element(webdriver, "//form[@class='attachmentForm']//div[@class='wrap']", 5).click()
	status = webdriver.find_element_by_name("xhpc_message_text")
	status.send_keys(text.decode("utf-8"))
	try: 
		wait_and_find_element(webdriver, "//form[@class='attachmentForm']//input[@type='submit']", 5).click()
	except:
		print "Could not click on the Post button"
	
### Main

if len(sys.argv) == 1 :
	LOGIN, PASSWORD = askForLoginAndPassword()
	
elif len(sys.argv) == 3 : 
	LOGIN = sys.argv[1]
	PASSWORD = sys.argv[2]
	
elif len(sys.argv) == 4: 
	LOGIN = sys.argv[1]
	PASSWORD = sys.argv[2]
	PAGE_USERNAME = sys.argv[3]

else :
	print "Wrong arguments for " + sys.argv[0]
	print "Usage:" 
	print "\t$:python " + sys.argv[0] + " <facebook-login> <password> "
	print "or"
	print "\t$:python " + sys.argv[0] + " <facebook-login> <password> <page-username>"
	print "with <page-username> being the official username of the Facebook page you admin" 
	quit()

totalLikeClicked = 0

driver = webdriver.Firefox()
driver.get("http://facebook.com/" + PAGE_USERNAME)

while not logIn(driver, LOGIN, PASSWORD):
	LOGIN, PASSWORD = askForLoginAndPassword()
	driver.get("http://facebook.com/" + PAGE_USERNAME)

# If [loveMachine] admin
if PAGE_USERNAME != "":
	wait_and_find_element(driver, "//form[@id='pageIdentitySwitchForm']//a", 10).click()
	print "Identity switch as [loveMachine]"  

# Getting to the Facebook news stream
driver.switch_to_default_content() # To prevent getWindow null error
driver.get("http://facebook.com")

if wait_and_find_elements(driver, "//ul[@id='home_stream']/li", 5) == 0 :
	print "Trying to find news stream" 
	# TODO: This will clearly not work in another language than english
	# Need to find another method. But who doesn't have his newstream on the facebook home?
	driver.find_element_by_link_text('News Feed').click()
	if wait_and_find_elements(driver, "//ul[@id='home_stream']/li", 15) == 0: 
		driver.fail("time out")
else: 
	print "Home stream available"


starttime = time.time() # When do we start the actual like clicking

# Finding "likes" 
likes = getAvailableLikes(driver, LIKE_PATH)
badLikesId = []

while len(likes) > len(badLikesId) and not SIMULATE :
	for likeToClick in likes :
		good = 1
		#Check if likeToClick is not already aregistered bad one
		for bad in badLikesId:
			if bad is likeToClick.id:
				good = 0
		
		if good :
			# click it
			for i in range(20):
				try:
					likeToClick.click()
				except:
					print "click a like error:" , sys.exc_info()
					if i == 19 :
						print "Facebook error: like has not been clicked"
						badLikesId.append(likeToClick.id)
						good = 0
					time.sleep(.5)
				else:
					totalLikeClicked+=1
					print "like #" + str(totalLikeClicked)
					break
			
		if good:
			# wait for Facebook to process it
			for i in range(20):
				try:
					likeToClick.is_displayed()
				except:
					# will  be called when likeToClick has disappeared
					print "like processed"
					break
				else:
					if i == 19 :
						print "Facebook error: like has not been processed"
						totalLikeClicked-=1
						badLikesId.append(likeToClick.id)
				time.sleep(.5)

	likes = getAvailableLikes(driver, LIKE_PATH)
	
endtime = time.time() # stop like clicking
totaltime = endtime-starttime

if totalLikeClicked != 0 :
	message = str(totalLikeClicked) + " ♥ (" + strTime(totaltime) + ") @[288578057830204:0]"
	print "Updating status: " + message
	if PAGE_USERNAME != "":
		updatePageStatus(driver, message)
	else: 
		updateUserStatus(driver, message)

logOut(driver)

# Quitting Webdriver
driver.close()


