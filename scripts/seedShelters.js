// scripts/seedShelters.js
// Usage:
//   MONGO_URI="mongodb://127.0.0.1:27017/aasra" node scripts/seedShelters.js
// or with npm script (see below)

require('dotenv').config();
const mongoose = require('mongoose');

// Reuse your Shelter model if you have it, otherwise define minimal inline schema:
let Shelter;
try {
  Shelter = require('../models/Shelter'); // prefer your app's model
} catch {
  const schema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      pincode: { type: String, trim: true },
      phone: { type: String, trim: true },
      logo: { type: String, trim: true },
      description: { type: String, trim: true },
      viewLink: { type: String, trim: true },
    },
    { timestamps: true }
  );
  schema.index({ name: 1, city: 1, pincode: 1 }, { unique: true, sparse: true });
  Shelter = mongoose.model('Shelter', schema);
}

const sample = [
  {
    name: "Mumbai Animal Aid",
    city: "Andheri West, Mumbai, MH",
    pincode: "400053",
    phone: "+91 22 2630 1122",
    logo: "https://placehold.co/120x120/0057b8/ffffff/png?text=MAA",
    description: "Rescue, foster and adoption services across Mumbai.",
    viewLink: "/shelter/mumbai-animal-aid"
  },
  {
    name: "Bengaluru Humane Society",
    city: "Jayanagar, Bengaluru, KA",
    pincode: "560041",
    phone: "+91 80 2678 3344",
    logo: "https://placehold.co/120x120/0b6e4f/ffffff/png?text=BHS",
    description: "Community-driven rescue, vaccination and awareness programs.",
    viewLink: "/shelter/bengaluru-humane-society"
  },
  {
    name: "Delhi Pets Foundation",
    city: "Lajpat Nagar, New Delhi, DL",
    pincode: "110024",
    phone: "+91 11 2467 8822",
    logo: "https://placehold.co/120x120/c71585/ffffff/png?text=DPF",
    description: "Adoption, medical camps and street animal care in Delhi.",
    viewLink: "/shelter/delhi-pets-foundation"
  },
  {
    name: "Kolkata Animal Rescue",
    city: "Gariahat, Kolkata, WB",
    pincode: "700029",
    phone: "+91 33 2456 7788",
    logo: "https://placehold.co/120x120/ff6f00/ffffff/png?text=KAR",
    description: "Shelter and rehabilitation services for Kolkata's animals.",
    viewLink: "/shelter/kolkata-animal-rescue"
  },
  {
    name: "Chennai Stray Care",
    city: "Adyar, Chennai, TN",
    pincode: "600020",
    phone: "+91 44 2445 9900",
    logo: "https://placehold.co/120x120/1e88e5/ffffff/png?text=CSC",
    description: "Spay/neuter drives and community outreach in Chennai.",
    viewLink: "/shelter/chennai-stray-care"
  },
  {
    name: "Hyderabad Hope Shelter",
    city: "Banjara Hills, Hyderabad, TS",
    pincode: "500034",
    phone: "+91 40 2356 4411",
    logo: "https://placehold.co/120x120/6b21a8/ffffff/png?text=HHS",
    description: "Long-term care and adoption programs in Hyderabad.",
    viewLink: "/shelter/hyderabad-hope-shelter"
  },
  {
    name: "Pune Paws Rescue",
    city: "Kothrud, Pune, MH",
    pincode: "411038",
    phone: "+91 20 2547 3322",
    logo: "https://placehold.co/120x120/00897b/ffffff/png?text=PPR",
    description: "Foster network and adoption events across Pune.",
    viewLink: "/shelter/pune-paws-rescue"
  },
  {
    name: "Ahmedabad Animal Helpline",
    city: "Navrangpura, Ahmedabad, GJ",
    pincode: "380009",
    phone: "+91 79 2642 1100",
    logo: "https://placehold.co/120x120/f4511e/ffffff/png?text=AAH",
    description: "Emergency rescues, medical aid and rehoming in Ahmedabad.",
    viewLink: "/shelter/ahmedabad-animal-helpline"
  },
  {
    name: "Jaipur Street Animal Care",
    city: "Bapu Nagar, Jaipur, RJ",
    pincode: "302015",
    phone: "+91 141 260 7788",
    logo: "https://placehold.co/120x120/7b1fa2/ffffff/png?text=JSAC",
    description: "Street animal feeding, medical camps and shelter support.",
    viewLink: "/shelter/jaipur-street-animal-care"
  },
  {
    name: "Lucknow Animal Welfare",
    city: "Hazratganj, Lucknow, UP",
    pincode: "226001",
    phone: "+91 522 220 3344",
    logo: "https://placehold.co/120x120/2e7d32/ffffff/png?text=LAW",
    description: "Rescue operations and adoption drives across Lucknow.",
    viewLink: "/shelter/lucknow-animal-welfare"
  },
  {
    name: "Coimbatore Companion Rescue",
    city: "RS Puram, Coimbatore, TN",
    pincode: "641002",
    phone: "+91 422 249 5566",
    logo: "https://placehold.co/120x120/0288d1/ffffff/png?text=CCR",
    description: "Local shelter focusing on senior and special-needs pets.",
    viewLink: "/shelter/coimbatore-companion-rescue"
  },
  {
    name: "Bhopal Animal Care Trust",
    city: "Arera Colony, Bhopal, MP",
    pincode: "462016",
    phone: "+91 755 276 8899",
    logo: "https://placehold.co/120x120/ff7043/ffffff/png?text=BACT",
    description: "Medical, foster and adoption services for central India.",
    viewLink: "/shelter/bhopal-animal-care-trust"
  },
  {
    name: "Thiruvananthapuram Pet Rescue",
    city: "Thampanoor, Trivandrum, KL",
    pincode: "695001",
    phone: "+91 471 233 4455",
    logo: "https://placehold.co/120x120/00796b/ffffff/png?text=TPR",
    description: "Coastal-region rescues and adoption services in Kerala.",
    viewLink: "/shelter/thiruvananthapuram-pet-rescue"
  },
  {
    name: "Chandigarh Animal Support",
    city: "Sector 17, Chandigarh, CH",
    pincode: "160017",
    phone: "+91 172 274 9900",
    logo: "https://placehold.co/120x120/9c27b0/ffffff/png?text=CAS",
    description: "Volunteer-driven rescue and community education programs.",
    viewLink: "/shelter/chandigarh-animal-support"
  },
  {
    name: "Guwahati Rescue & Rehome",
    city: "Paltan Bazaar, Guwahati, AS",
    pincode: "781008",
    phone: "+91 361 230 1122",
    logo: "https://placehold.co/120x120/ff5722/ffffff/png?text=GRR",
    description: "Northeast rescue hub offering shelter and adoption services.",
    viewLink: "/shelter/guwahati-rescue-rehome"
  }
];

(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aasra';
  try {
    await mongoose.connect(uri, { autoIndex: true });
    console.log('Mongo connected');

    // If collection has any docs, assume already seeded.
    const existingCount = await Shelter.estimatedDocumentCount();
    if (existingCount > 0) {
      console.log(`Shelters already present (${existingCount}). Skipping seeding.`);
      return;
    }

    // Optional: ensure unique index to avoid dupes by name+city+pincode
    try {
      await Shelter.collection.createIndex({ name: 1, city: 1, pincode: 1 }, { unique: true, sparse: true });
      console.log('Ensured unique index on (name, city, pincode)');
    } catch (e) {
      // ignore if exists
    }

    const inserted = await Shelter.insertMany(sample, { ordered: false });
    console.log(`Inserted ${inserted.length} shelters.`);
  } catch (e) {
    console.error('Seed error:', e);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
  }
})();
