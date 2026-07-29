// Sets de películas: cada set es un grupo de versiones de la misma peli.
// El juego pide OMDb los ratings de IMDb en runtime y compara.
export const MOVIE_SETS = [
  { name: "The Lion King", versions: [
    { title: "The Lion King", year: "1994" },
    { title: "The Lion King", year: "2019" },
  ]},
  { name: "Psycho", versions: [
    { title: "Psycho", year: "1960" },
    { title: "Psycho", year: "1998" },
  ]},
  { name: "Dune", versions: [
    { title: "Dune", year: "1984" },
    { title: "Dune", year: "2021" },
  ]},
  { name: "King Kong", versions: [
    { title: "King Kong", year: "1933" },
    { title: "King Kong", year: "1976" },
    { title: "King Kong", year: "2005" },
  ]},
  { name: "Ghostbusters", versions: [
    { title: "Ghostbusters", year: "1984" },
    { title: "Ghostbusters", year: "2016" },
  ]},
  { name: "Total Recall", versions: [
    { title: "Total Recall", year: "1990" },
    { title: "Total Recall", year: "2012" },
  ]},
  { name: "RoboCop", versions: [
    { title: "RoboCop", year: "1987" },
    { title: "RoboCop", year: "2014" },
  ]},
  { name: "Suspiria", versions: [
    { title: "Suspiria", year: "1977" },
    { title: "Suspiria", year: "2018" },
  ]},
  { name: "Carrie", versions: [
    { title: "Carrie", year: "1976" },
    { title: "Carrie", year: "2013" },
  ]},
  { name: "The Thing", versions: [
    { title: "The Thing", year: "1982" },
    { title: "The Thing", year: "2011" },
  ]},
  { name: "Cape Fear", versions: [
    { title: "Cape Fear", year: "1962" },
    { title: "Cape Fear", year: "1991" },
  ]},
  { name: "Scarface", versions: [
    { title: "Scarface", year: "1932" },
    { title: "Scarface", year: "1983" },
  ]},
  { name: "The Manchurian Candidate", versions: [
    { title: "The Manchurian Candidate", year: "1962" },
    { title: "The Manchurian Candidate", year: "2004" },
  ]},
  { name: "Halloween", versions: [
    { title: "Halloween", year: "1978" },
    { title: "Halloween", year: "2007" },
    { title: "Halloween", year: "2018" },
  ]},
  { name: "Solaris", versions: [
    { title: "Solaris", year: "1972" },
    { title: "Solaris", year: "2002" },
  ]},
  { name: "True Grit", versions: [
    { title: "True Grit", year: "1969" },
    { title: "True Grit", year: "2010" },
  ]},
  { name: "Straw Dogs", versions: [
    { title: "Straw Dogs", year: "1971" },
    { title: "Straw Dogs", year: "2011" },
  ]},
  { name: "A Nightmare on Elm Street", versions: [
    { title: "A Nightmare on Elm Street", year: "1984" },
    { title: "A Nightmare on Elm Street", year: "2010" },
  ]},
  { name: "Friday the 13th", versions: [
    { title: "Friday the 13th", year: "1980" },
    { title: "Friday the 13th", year: "2009" },
  ]},
  { name: "Point Break", versions: [
    { title: "Point Break", year: "1991" },
    { title: "Point Break", year: "2015" },
  ]},
  { name: "Poltergeist", versions: [
    { title: "Poltergeist", year: "1982" },
    { title: "Poltergeist", year: "2015" },
  ]},
  { name: "Pet Sematary", versions: [
    { title: "Pet Sematary", year: "1989" },
    { title: "Pet Sematary", year: "2019" },
  ]},
  { name: "Fright Night", versions: [
    { title: "Fright Night", year: "1985" },
    { title: "Fright Night", year: "2011" },
  ]},
  { name: "Clash of the Titans", versions: [
    { title: "Clash of the Titans", year: "1981" },
    { title: "Clash of the Titans", year: "2010" },
  ]},
  { name: "Beauty and the Beast", versions: [
    { title: "Beauty and the Beast", year: "1991" },
    { title: "Beauty and the Beast", year: "2017" },
  ]},
  { name: "Aladdin", versions: [
    { title: "Aladdin", year: "1992" },
    { title: "Aladdin", year: "2019" },
  ]},
  { name: "Mulan", versions: [
    { title: "Mulan", year: "1998" },
    { title: "Mulan", year: "2020" },
  ]},
  { name: "Cinderella", versions: [
    { title: "Cinderella", year: "1950" },
    { title: "Cinderella", year: "2015" },
  ]},
  { name: "Dumbo", versions: [
    { title: "Dumbo", year: "1941" },
    { title: "Dumbo", year: "2019" },
  ]},
  { name: "Pinocchio", versions: [
    { title: "Pinocchio", year: "1940" },
    { title: "Pinocchio", year: "2022" },
  ]},
  { name: "Little Women", versions: [
    { title: "Little Women", year: "1994" },
    { title: "Little Women", year: "2019" },
  ]},
  { name: "Dawn of the Dead", versions: [
    { title: "Dawn of the Dead", year: "1978" },
    { title: "Dawn of the Dead", year: "2004" },
  ]},
  { name: "The Fly", versions: [
    { title: "The Fly", year: "1958" },
    { title: "The Fly", year: "1986" },
  ]},
  { name: "Invasion of the Body Snatchers", versions: [
    { title: "Invasion of the Body Snatchers", year: "1956" },
    { title: "Invasion of the Body Snatchers", year: "1978" },
  ]},
  { name: "3:10 to Yuma", versions: [
    { title: "3:10 to Yuma", year: "1957" },
    { title: "3:10 to Yuma", year: "2007" },
  ]},
  { name: "Assault on Precinct 13", versions: [
    { title: "Assault on Precinct 13", year: "1976" },
    { title: "Assault on Precinct 13", year: "2005" },
  ]},
  { name: "Papillon", versions: [
    { title: "Papillon", year: "1973" },
    { title: "Papillon", year: "2017" },
  ]},
  { name: "The Karate Kid", versions: [
    { title: "The Karate Kid", year: "1984" },
    { title: "The Karate Kid", year: "2010" },
  ]},
  { name: "Footloose", versions: [
    { title: "Footloose", year: "1984" },
    { title: "Footloose", year: "2011" },
  ]},
  { name: "Ocean's Eleven", versions: [
    { title: "Ocean's Eleven", year: "1960" },
    { title: "Ocean's Eleven", year: "2001" },
  ]},
  { name: "The Getaway", versions: [
    { title: "The Getaway", year: "1972" },
    { title: "The Getaway", year: "1994" },
  ]},
  { name: "War of the Worlds", versions: [
    { title: "The War of the Worlds", year: "1953" },
    { title: "War of the Worlds", year: "2005" },
  ]},
  { name: "Planet of the Apes", versions: [
    { title: "Planet of the Apes", year: "1968" },
    { title: "Planet of the Apes", year: "2001" },
  ]},
  { name: "Willy Wonka / Charlie", versions: [
    { title: "Willy Wonka & the Chocolate Factory", year: "1971" },
    { title: "Charlie and the Chocolate Factory", year: "2005" },
  ]},
  { name: "The Grinch", versions: [
    { title: "How the Grinch Stole Christmas", year: "2000" },
    { title: "The Grinch", year: "2018" },
  ]},
  { name: "The Parent Trap", versions: [
    { title: "The Parent Trap", year: "1961" },
    { title: "The Parent Trap", year: "1998" },
  ]},
  { name: "Freaky Friday", versions: [
    { title: "Freaky Friday", year: "1976" },
    { title: "Freaky Friday", year: "2003" },
  ]},
  { name: "The Italian Job", versions: [
    { title: "The Italian Job", year: "1969" },
    { title: "The Italian Job", year: "2003" },
  ]},
  { name: "The Magnificent Seven", versions: [
    { title: "The Magnificent Seven", year: "1960" },
    { title: "The Magnificent Seven", year: "2016" },
  ]},
  { name: "Death Race 2000 / Death Race", versions: [
    { title: "Death Race 2000", year: "1975" },
    { title: "Death Race", year: "2008" },
  ]},
];
