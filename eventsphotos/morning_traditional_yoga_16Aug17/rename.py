#! /usr/bin/python

from glob import glob
import os

files = glob("*.jpeg")
files.sort()

for idx, file in enumerate(files):
    print(file)
    newName = str(idx + 1) + ".jpg"
    if not newName in files:
        os.rename(file, newName)
    else:
        print("File " + newName + " already exists!. Therefore not renaming.")