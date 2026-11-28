/* data/district-images.js
   WHAT IT IS: district name -> list of illustration images for the prayer page.
   Keys must match BD_DISTRICTS district names in data/district.js exactly.
   Districts not listed here use BD_DEFAULT_DISTRICT_IMAGE.
   LOAD ORDER: put this right after data/district.js
*/
const BD_DISTRICT_IMAGES = {
  "ঢাকা": ["data/districts/dhaka_lalbagh_fort.webp"],
  "নারায়ণগঞ্জ": ["data/districts/Narayanganj_Panam_City.webp"],
  "মুন্সিগঞ্জ": ["data/districts/munshiganj.webp"],
  "মানিকগঞ্জ": ["data/districts/manikganj.webp"],
  "টাঙ্গাইল": ["data/districts/Tangail_Madhupur_River_Fields.webp"],
  "কিশোরগঞ্জ": ["data/districts/Kishoreganj_Nikli_Haor.webp"],
  "ফরিদপুর": ["data/districts/faridpur.webp"],
  "গোপালগঞ্জ": ["data/districts/gopalganj.webp"],
  "মাদারীপুর": ["data/districts/madaripur.webp"],
  "রাজবাড়ী": ["data/districts/Rajbari_Goalanda_Ghat_Padma.webp"],
  "কক্সবাজার": ["data/districts/coxsbazar_harbor.webp"],
  "কুমিল্লা": ["data/districts/cumilla_shalban_vihara.webp"],
  "ফেনী": ["data/districts/feni.webp"],
  "নোয়াখালী": ["data/districts/noakhali.webp"],
  "চাঁদপুর": ["data/districts/chandpur.webp"],
  "লক্ষ্মীপুর": ["data/districts/lakshmipur.webp"],
  "খাগড়াছড়ি": ["data/districts/khagrachari.webp"],
  "রাঙ্গামাটি": ["data/districts/Rangamati_Kaptai_Lake.webp"],
  "বান্দরবান": ["data/districts/bandarban.webp"],
  "রাজশাহী": ["data/districts/Rajshahi_Puthia_Temple_Mango_Silk.webp"],
  "বগুড়া": ["data/districts/bogura.webp"],
  "নওগাঁ": ["data/districts/naogaon_somapura_mahavihara.webp"],
  "নাটোর": ["data/districts/natore.webp"],
  "চাঁপাইনবাবগঞ্জ": ["data/districts/Chapainawabganj_Sona_Mosque.webp"],
  "পাবনা": ["data/districts/Pabna_Hardinge_Bridge_Chalan_Beel.webp"],
  "সিরাজগঞ্জ": ["data/districts/sirajganj.webp"],
  "খুলনা": ["data/districts/khulna_sundarbans.webp"],
  "বাগেরহাট": ["data/districts/Bagerhat_Sixty_Dome_Mosque.webp"],
  "চুয়াডাঙ্গা": ["data/districts/chuadanga.webp"],
  "যশোর": ["data/districts/Jashore_Gadkhali_Flower_Fields.webp"],
  "ঝিনাইদহ": ["data/districts/Jhenaidah_Naldanga_Temple.webp"],
  "কুষ্টিয়া": ["data/districts/kushtia.webp"],
  "মাগুরা": ["data/districts/magura.webp"],
  "মেহেরপুর": ["data/districts/meherpur.webp"],
  "নড়াইল": ["data/districts/narail.webp"],
  "সাতক্ষীরা": ["data/districts/Satkhira_Sundarbans.webp"],
  "বরিশাল": ["data/districts/barishal.webp"],
  "বরগুনা": ["data/districts/barguna.webp"],
  "ভোলা": ["data/districts/Bhola_Char_Kukri_Mukri.webp"],
  "ঝালকাঠি": ["data/districts/Jhalokathi_Gabkhan_Timber_Market.webp"],
  "পটুয়াখালী": ["data/districts/patuakhali_kuakata_beach.webp"],
  "পিরোজপুর": ["data/districts/pirojpur.webp"],
  "সিলেট": ["data/districts/sylhet.webp"],
  "হবিগঞ্জ": ["data/districts/habiganj.webp"],
  "মৌলভীবাজার": ["data/districts/moulvibazar_waterfall_tea.webp"],
  "সুনামগঞ্জ": ["data/districts/sunamganj_boat_lily.webp"],
  "রংপুর": ["data/districts/rangpur.webp"],
  "দিনাজপুর": ["data/districts/Dinajpur_Kantajew_Litchi.webp"],
  "গাইবান্ধা": ["data/districts/gaibandha.webp"],
  "কুড়িগ্রাম": ["data/districts/kurigram.webp"],
  "লালমনিরহাট": ["data/districts/lalmonirhat_teesta_barrage.webp"],
  "নীলফামারী": ["data/districts/nilphamari.webp"],
  "পঞ্চগড়": ["data/districts/panchagarh_teatulia_tea.webp"],
  "ময়মনসিংহ": ["data/districts/mymensingh.webp"],
  "গাজীপুর": ["data/districts/gazipur_bhawal_forest.webp"],
  "নরসিংদী": ["data/districts/narsingdi_wari_bateshwar.webp"],
  "শরীয়তপুর": ["data/districts/shariatpur_padma_bridge.webp"],
  "চট্টগ্রাম": ["data/districts/chattogram_port.webp"],
  "নেত্রকোনা": ["data/districts/netrokona_bijoypur_hills.webp"],
  "শেরপুর": ["data/districts/sherpur_garo_hills.webp"],
  "জয়পুরহাট": ["data/districts/Joypurhat_Hinda_Shahi_Mosque.webp"],
  "ঠাকুরগাঁও": ["data/districts/Thakurgaon_Zamindar_Bari.webp"],
  "ব্রাহ্মণবাড়িয়া": ["data/districts/Brahmanbaria_Mango_Mosque.webp"],
  "জামালপুর": ["data/districts/jamalpur.webp"]
};

const BD_DEFAULT_DISTRICT_IMAGE = "data/districts/default_mustard_field.webp";

/* returns one image path for a district name (first image; use idx to pick another) */
function getDistrictImage(name, idx) {
  const list = BD_DISTRICT_IMAGES[name];
  if (!list || !list.length) return BD_DEFAULT_DISTRICT_IMAGE;
  return list[(idx || 0) % list.length];
}
