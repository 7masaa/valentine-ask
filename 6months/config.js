/*
  EDIT THIS FILE to personalise the 6-month wish banner.

  Everything she reads comes from here. The cards retell the moments from
  this site so far; rewrite any of them in your own words.

  Photos (and the song, if you add one) go in this same "6months" folder.
  Upload them, then write just the file name below, e.g. photo: "month1.jpg".
*/

const CONFIG = {
  herName: "Nessa",

  // The day you got together (YYYY-MM-DD), e.g. "2026-02-14".
  // Fills in the live "Together for" counter; leave it "" to hide the counter.
  startDate: "",

  // The banner's name, shown big on the wish screen.
  bannerTitle: "Half a Year of Us",

  // Optional: your song, e.g. "our-song.mp3". Leave "" for no music.
  song: "",

  // One card per Intertwined Fate, in the order she pulls them.
  // The last card is the guaranteed 5★, so save the best for last.
  //
  //   label    – small text above the title
  //   title    – the card's name
  //   memory   – a few lines about it (use \n to start a new line)
  //   photo    – a photo in this folder, e.g. "month1.jpg"
  //   pixelArt – or a pixel-art image from the site, shown on the moon like the cat
  //              (with neither, the cat shows)
  //   bonus    – the love coupon that comes with it (on the 5★ it's your date plan)
  cards: [
    {
      label: "The letter",
      title: "A Letter for My Nessa",
      memory: "A pixel envelope with your name on it, and one question inside: will you be mine?",
      photo: "",
      pixelArt: "/envelope.png",
      bonus: "Win Any Argument ×1",
    },
    {
      label: "The No button",
      title: "It Never Stood a Chance",
      memory: "Tap No and Yes just got bigger. Later, No learned to run away. There was only ever one answer.",
      photo: "",
      pixelArt: "/no.png",
      bonus: "You Pick the Movie, No Complaints ×1",
    },
    {
      label: "Valentine's date",
      title: "Genshin at 10pm",
      memory: "Our Valentine's date: Genshin Impact at 10pm. Dress fancy!",
      photo: "",
      pixelArt: "",
      bonus: "I Solve Every Puzzle ×1",
    },
    {
      label: "The answer",
      title: "She Said Yes",
      memory: "YES!!! ❤️\nAnd a little cat that hasn't stopped dancing since.",
      photo: "",
      pixelArt: "/yes.png",
      bonus: "Unlimited Compliments for a Day ×1",
    },
    {
      label: "Three months",
      title: "Timeless Love",
      memory: "A whole page of us: our timeline, a love letter, a memory gallery, and a night sky where every star held a promise.",
      photo: "",
      pixelArt: "",
      bonus: "I Plan the Next Date ×1",
    },
    {
      label: "Six months",
      title: "Half a Year of Us",
      memory: "From a pixel envelope and a No button that never stood a chance, to half a year of us. I'd make every one of these wishes again.",
      photo: "",
      pixelArt: "",
      bonus: "Date night: Genshin Impact at 10pm. Dress fancy!",
    },
  ],
};
