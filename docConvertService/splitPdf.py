import os
import uuid
from pdf2image import convert_from_path
from pdf2image.exceptions import (
    PDFInfoNotInstalledError,
    PDFPageCountError,
    PDFSyntaxError,
)


class SplitPdf(object):
    def make_dir(self, newDir):
        print("newDir in module", newDir)
        self.directory = newDir
        self.parent_dir = "../Documents/Converted/"
        self.path = os.path.join(self.parent_dir, self.directory)
        os.mkdir(self.path)

    def split_and_convert(self, pathArg, newDir):
        arr = [
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h",
            "i",
            "j",
            "k",
            "l",
            "m",
            "n",
            "o",
            "p",
            "q",
            "r",
            "s",
            "t",
            "u",
            "v",
            "w",
            "x",
            "y",
            "z",
            "aa",
            "ab",
            "ac",
            "ad",
            "ae",
            "af",
            "ag",
            "ah",
            "ai",
            "ak",
            "al",
            "am",
            "an",
            "ao",
            "ap",
            "aq",
            "ar",
            "as",
            "at",
            "au",
            "av",
            "aw",
            "ax",
            "ay",
            "az",
            "ba",
            "bb",
            "bc",
            "bd",
            "be",
            "bf",
            "bg",
            "bh",
            "bi",
            "bk",
            "bl",
            "bm",
            "bn",
            "bo",
            "bp",
            "bq",
            "br",
            "bs",
            "bt",
            "bu",
            "bv",
            "bw",
            "bx",
            "by",
            "bz",
            "za",
            "zb",
            "zc",
            "zd",
            "ze",
            "zf",
            "zg",
            "zh",
            "zi",
            "zj",
            "zk",
            "zl",
            "zm",
            "zn",
            "zo",
            "zp",
            "zq",
            "zr",
            "zs",
            "zt",
            "zu",
            "zv",
            "zw",
            "zx",
            "zy",
            "zz",
        ]
        self.images = convert_from_path(pathArg, fmt="png")
        for i, image in enumerate(self.images):
            fname = f"{newDir}" + arr[i] + ".png"
            image.save(f"../Documents/Converted/{self.directory}/{fname}", "PNG")


# split pdf to multiple png files
# https://pypi.org/project/pdf2image/
# https://pythonforundergradengineers.com/pdf-to-multiple-images.html
# convert to js(?):
# https://www.npmjs.com/package/pdf2image
