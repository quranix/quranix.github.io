/* data/hadith.js
   WHAT IT IS: extra info for the hadith of the 6 books (short title, topics). The hadith text itself still comes from the CDN.
   NAME INSIDE: QX_HADITH
   KEY: "<collection id>|<hadith_id>"
     - collection id = Bukhari, Muslim, AbuDaud, At-tirmizi, Al-Nasai, Ibne-Mazah
     - hadith_id = the number shown on the card (it runs through the whole book; never use a chapter number)
   EACH ENTRY (every field optional): title = short title shown above the Arabic · topics = list of topic names
   ORDER: does not matter. Add new entries anywhere, nothing shifts.
   SCREEN CODE: js/quran.js (buildHadithAyahCard) */
var QX_HADITH = {
  // উদাহরণ (নিজের এন্ট্রি দিয়ে বদলান বা মুছুন)
  "Bukhari|1": { title: "নিয়ত", topics: ["নিয়ত"] },
  "Bukhari|8": { title: "ইসলামের স্তম্ভ", topics: ["ঈমান"] }
};
