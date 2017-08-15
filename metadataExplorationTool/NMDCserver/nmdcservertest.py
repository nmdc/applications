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

