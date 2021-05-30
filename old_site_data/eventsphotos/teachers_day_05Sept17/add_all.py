#! /usr/bin/python

base_html = "base.html"
out_html = "display.html"
photo_base_path = "./"

import glob

def html_for_img(filePath, caption="Event Photo"):
    template = \
    "    <div class=\"col-md-4\">\n" + \
    "      <div class=\"thumbnail\">\n" + \
    "        <a href=\"" + filePath + "\" target=\"_blank\">\n" + \
    "          <img src=\"" + filePath + "\" alt=\"Picture\" style=\"width:100%\">\n" + \
    "          <div class=\"caption\">\n" + \
    "            <p>" + caption + "</p>\n" + \
    "          </div>\n" + \
    "        </a>\n" + \
    "      </div>\n" + \
    "    </div>\n\n"

    return template

pic_files = glob.glob(photo_base_path + "*.png")
pic_files += glob.glob(photo_base_path + "*.jpg")

pic_files.sort()

baseFileObj = open(base_html)
outFileObj = open(out_html, "w")

replaced_text = ""
for f in pic_files:
    replaced_text += html_for_img(f)

print(replaced_text)

for line in baseFileObj:
    if line.strip() == "<!-- Replace Me -->":
        line = replaced_text
    outFileObj.write(line)

baseFileObj.close()
outFileObj.close()
