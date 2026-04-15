export type Member = {
  name: string;
  role?: string;
  photo?: string;
};

export type MemberGroup = {
  label: string;
  members: Member[];
};

export const BOARD: MemberGroup = {
  label: "Vorstand",
  members: [
    {
      name: "Christoph Schuler",
      role: "Obmann",
      photo: "/mitglieder/ObmannChristophSchuler.jpg",
    },
    {
      name: "Christian Breuss",
      role: "Vizeobmann",
      photo: "/mitglieder/christianbreus.jpg",
    },
    {
      name: "Martina Zögernitz",
      role: "Schriftführerin & Kassierin",
      photo: "/mitglieder/martinazoegernitz.JPG",
    },
    {
      name: "Manuel Schuler",
      role: "Vorstand",
      photo: "/mitglieder/manuelschuler.jpg",
    },
    {
      name: "Herbert Schuler",
      role: "Vorstand",
      photo: "/mitglieder/herbertschuler.jpg",
    },
    {
      name: "Alex Schmöllerl",
      role: "Fahrervertreter",
    },
    {
      name: "Elias Schnetzer",
      role: "Sportrat",
    },
    {
      name: "Gernot Kogler",
      role: "Sportrat",
      photo: "/fahrer/SPORTRATGernotKogler.jpg",
    },
    {
      name: "Andrea Schuler",
      role: "Kassaprüferin",
      photo: "/mitglieder/andreaschuler.JPG",
    },
    {
      name: "Marion Neusiedler",
      role: "Kassaprüferin",
    },
  ],
};

export const HONORARY: MemberGroup = {
  label: "Ehrenmitglieder",
  members: [
    { name: "Armin Gassner", role: "Ehrenobmann", photo: "/mitglieder/armingassner.jpg" },
    { name: "Fritz Kogler", role: "Ehrenvizeobmann", photo: "/mitglieder/fritzkogler.jpg" },
    { name: "Adrian Imthurn", role: "Ehrenmitglied", photo: "/mitglieder/AdrianImthurn.jpg" },
    { name: "Gerd Lampert", role: "Ehrenmitglied", photo: "/mitglieder/GerdLampert.jpg" },
  ],
};

export const MEMBERS: MemberGroup = {
  label: "Mitglieder",
  members: [
    { name: "Joe Dorner", photo: "/mitglieder/ObmannStellvertreterJoeDorner.jpg" },
    { name: "Dieter Bettinazzi", photo: "/mitglieder/DieterBettinazzi.jpg" },
    { name: "Günter Matt", photo: "/mitglieder/GuenterMatt.jpg" },
    { name: "Johanna Matt", photo: "/mitglieder/JohannaMauracher.jpg" },
    { name: "Manfred Fischer", photo: "/mitglieder/ManfredFischer.jpg" },
    { name: "Marco Schmid", photo: "/mitglieder/MarcoSchmid.jpg" },
    { name: "Mike Korpics", photo: "/mitglieder/MikeKorpics.jpg" },
    { name: "Norbert Matt", photo: "/mitglieder/NorbertMatt.JPG" },
    { name: "Sarah Matt", photo: "/mitglieder/SarahMatt.jpg" },
    { name: "Wolfgang Ospelt", photo: "/mitglieder/WolfgangOspelt.jpg" },
    { name: "Rainer Neusiedler", photo: "/mitglieder/RainerNeusiedler.jpg" },
    { name: "Melanie Schnetzer", photo: "/mitglieder/MelanieSchnetzer.jpg" },
    { name: "Tobias Sohler", photo: "/mitglieder/TobiasSohler.JPG" },
    { name: "Daniel Zimmermann", photo: "/mitglieder/DanielZimmermann.jpg" },
    { name: "Thomas Ammann" },
    { name: "Rene Bargehr" },
    { name: "Michael Bargehr" },
    { name: "Anja Dorner" },
    { name: "Michael Gassner" },
    { name: "Martin Taumberger" },
    { name: "David Wiederin" },
    { name: "Peter Füchsl" },
  ],
};
