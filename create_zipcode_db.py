import json

# Comprehensive postal code to coordinates mapping for Benelux
zipcode_coords = {
    # BELGIUM (Brussels and surroundings - 1000-1210)
    "1000": [50.8503, 4.3517],  # Brussels
    "1010": [50.8509, 4.3747],  # Brussels
    "1012": [50.8505, 4.3549],  # Brussels
    "1018": [50.8575, 4.3658],  # Brussels
    "1040": [50.8405, 4.4012],  # Bruxelles-Etterbeek
    "1050": [50.8344, 4.3627],  # Brussels-Ixelles
    "1060": [50.8347, 4.3334],  # Brussels-Saint-Gilles
    "1065": [50.8260, 4.3368],  # Brussels
    "1066": [50.8175, 4.3404],  # Brussels-Forest
    "1070": [50.8245, 4.3173],  # Brussels-Anderlecht
    "1080": [50.8546, 4.3046],  # Brussels-Jette
    "1081": [50.8574, 4.2987],  # Brussels-Jette
    "1082": [50.8610, 4.3182],  # Brussels-Berchem-Sainte-Agathe
    "1090": [50.8654, 4.3647],  # Brussels-Schaerbeek
    "1095": [50.8724, 4.4012],  # Brussels-Evere
    "1098": [50.8698, 4.4095],  # Brussels-Evere
    "1105": [50.8829, 4.4268],  # Brussels-Woluwe-St-Pierre
    "1180": [50.8169, 4.4272],  # Brussels-Uccle
    "1190": [50.7895, 4.4245],  # Brussels-Forest
    "1200": [50.8087, 4.4452],  # Brussels-Woluwé-Saint-Lambert
    "1210": [50.8007, 4.4798],  # Brussels-Watermael-Boitsfort
    
    # BELGIUM (Antwerp and surroundings)
    "2000": [51.2213, 4.3998],  # Antwerp
    "2010": [51.2321, 4.4124],  # Antwerp
    "2020": [51.2138, 4.3876],  # Antwerp
    
    # BELGIUM (Bruges/Gent area)
    "8000": [51.2093, 3.2244],  # Bruges
    "8200": [51.1744, 3.1833],  # Bruges-Zeebrugge
    "8500": [50.9597, 3.0667],  # Courtrai
    "9000": [51.0379, 3.7196],  # Ghent/Gent
    "9200": [51.1622, 3.8244],  # Dendermonde
    
    # BELGIUM (Liege/Liège area)
    "4000": [50.6333, 5.5667],  # Liège
    "4020": [50.6292, 5.5797],  # Liège
    "4030": [50.6183, 5.5933],  # Grivegnée
    
    # BELGIUM (Namur area)
    "5000": [50.4667, 4.8667],  # Namur
    "5100": [50.4200, 4.7042],  # Namur
    "5500": [50.2667, 4.8833],  # Dinant
    
    # BELGIUM (Charleroi area)
    "6000": [50.4108, 4.4442],  # Charleroi
    "6200": [50.3817, 4.8517],  # Châtelet
    "6500": [50.2667, 4.5667],  # Fontaine-l'Évêque
    
    # LUXEMBOURG (major cities)
    "1011": [49.6116, 6.1319],  # Luxembourg City
    "1348": [49.6116, 6.1319],  # Luxembourg City
    "4300": [49.5256, 5.9833],  # Esch-sur-Alzette
    "4400": [49.5256, 5.9833],  # Esch-sur-Alzette
    
    # NETHERLANDS (Amsterdam area)
    "1000": [52.3676, 4.9041],  # Amsterdam
    "1012": [52.3729, 4.8952],  # Amsterdam
    "1018": [52.3754, 4.9002],  # Amsterdam
    "1040": [52.3597, 4.8945],  # Amsterdam
    "1050": [52.3531, 4.8858],  # Amsterdam
    "1066": [52.3405, 4.8813],  # Amsterdam
    "1070": [52.3333, 4.8689],  # Amsterdam
    "1081": [52.3491, 4.9230],  # Amsterdam
    "1090": [52.3751, 4.9345],  # Amsterdam
    "1098": [52.3648, 4.9442],  # Amsterdam
    "1105": [52.3798, 4.8929],  # Amsterdam
    "1180": [52.3176, 4.8505],  # Amsterdam
    "1200": [52.3084, 4.8699],  # Amsterdam
    "1210": [52.2886, 4.8614],  # Amsterdam
    
    # NETHERLANDS (Leiden area)
    "2300": [52.1601, 4.4944],  # Leiden
    "2311": [52.1720, 4.5119],  # Leiden
    "2333": [52.1850, 4.4567],  # Leiden
    "2440": [52.0333, 4.3667],  # Leiderdorp
    
    # NETHERLANDS (Utrecht area)
    "3500": [52.0908, 5.1186],  # Utrecht
    "3501": [52.0906, 5.1154],  # Utrecht
    "3504": [52.0916, 5.1152],  # Utrecht
    "3505": [52.0898, 5.1239],  # Utrecht
    "3510": [52.0866, 5.1184],  # Utrecht
    "3511": [52.0843, 5.1118],  # Utrecht
    "3512": [52.0841, 5.1086],  # Utrecht
    "3513": [52.0851, 5.1028],  # Utrecht
    "3514": [52.0859, 5.1001],  # Utrecht
    "3515": [52.0868, 5.0973],  # Utrecht
    "3581": [52.1209, 5.1867],  # Zeist
    "3584": [52.1267, 5.2584],  # Bilthoven
    "3600": [52.0333, 5.1167],  # Utrecht
    "3605": [52.0292, 5.1242],  # Maarssen
    "3015": [52.0667, 5.0667],  # Nieuwegein
    
    # NETHERLANDS (Nijmegen area)
    "6500": [51.8425, 5.8520],  # Nijmegen
    "6525": [51.8667, 5.8667],  # Nijmegen
    
    # NETHERLANDS (Eindhoven area)
    "5600": [51.4416, 5.4697],  # Eindhoven
    "5610": [51.4408, 5.4778],  # Eindhoven
    "5612": [51.4380, 5.4733],  # Eindhoven
    "5613": [51.4408, 5.4608],  # Eindhoven
    "5616": [51.4440, 5.4683],  # Eindhoven
    "5617": [51.4467, 5.4647],  # Eindhoven
    "5625": [51.4244, 5.4911],  # Eindhoven
    "5645": [51.4097, 5.4358],  # Veldhoven
    "5654": [51.4308, 5.5119],  # Nuenen
    "5657": [51.4236, 5.4917],  # Best
    "5661": [51.4069, 5.5197],  # Son en Breugel
    "5700": [51.4500, 5.5000],  # Eindhoven area
    "5708": [51.4597, 5.5208],  # Eindhoven
    "6708": [51.4416, 5.4697],  # Eindhoven
    
    # NETHERLANDS (Groningen area)
    "9700": [53.2130, 6.5681],  # Groningen
    "9711": [53.2211, 6.5739],  # Groningen
    "9712": [53.2145, 6.5597],  # Groningen
    "9713": [53.2100, 6.5531],  # Groningen
    "9714": [53.2079, 6.5686],  # Groningen
    "9715": [53.2118, 6.5809],  # Groningen
    "9716": [53.2176, 6.5914],  # Groningen
    "9717": [53.2222, 6.5853],  # Groningen
    "9718": [53.2268, 6.5697],  # Groningen
    "9719": [53.2295, 6.5562],  # Groningen
    "9720": [53.2325, 6.5467],  # Groningen
    "9722": [53.2089, 6.6236],  # Groningen
    "9723": [53.2012, 5.5928],  # Groningen
    "9724": [53.1982, 6.5706],  # Groningen
    "9725": [53.1980, 6.5489],  # Groningen
    "9726": [53.2011, 6.5294],  # Groningen
    "9727": [53.2121, 6.5114],  # Groningen
    "9728": [53.2264, 6.5108],  # Groningen
}

# Save to JSON
with open('public/zipcode_coordinates.json', 'w', encoding='utf-8') as f:
    json.dump(zipcode_coords, f, indent=2)

print(f"Created zipcode_coordinates.json with {len(zipcode_coords)} entries")
print("Coverage:")
print(f"  Belgium: {sum(1 for z in zipcode_coords if int(z) < 10000)}")
print(f"  Luxembourg: {sum(1 for z in zipcode_coords if int(z) >= 1000 and int(z) < 5000)}")
print(f"  Netherlands: {sum(1 for z in zipcode_coords if int(z) >= 1000)}")
