# Copyright (c) 2016 Norwegian Marine Data Centre
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
# documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
# rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
# persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial
# portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
# WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
# COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
# OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import psycopg2


con = psycopg2.connect(database='infrastruktur_datasett', user='infrastruktur_datasett', password='ra2sl0pb',
                       host='82.134.28.244', port='5432')
cur = con.cursor()

cur.execute("SELECT dataset.dataset_id, dataset.entry_title FROM public.dataset;")
name_rows = cur.fetchall()

cur.execute(
    "SELECT spatial_coverage.dataset_id, spatial_coverage.northern_latitude, spatial_coverage.southern_latitude, spatial_coverage.western_longitude, spatial_coverage.eastern_longitude  FROM public.spatial_coverage;")
pos_rows = cur.fetchall()

pos_dict = {}
for row in pos_rows:
    #print row
    pos_dict[row[0]] = row[1:]

#print pos_dict

name_pos_dict = {}

for row in name_rows:
    print row
    if len(row[1]) > 0 and row[0] in pos_dict:
        name_pos_dict[str(row[1])] = ' pos(N,S,W,E) = ' + str(pos_dict[row[0]])
con.close()

