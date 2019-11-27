from os import listdir
from os.path import isfile, join
from datetime import datetime

logpath = "/data/igct_backend/logs/"

onlyfiles = [f for f in listdir(logpath) if isfile(join(logpath, f))]

now = datetime.now()
day = now.strftime("%d")
month = now.strftime("%m")
year = now.strftime("%Y")

print(day)
print(month)
print(year)



print(onlyfiles)