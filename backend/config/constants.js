export const SANTA_CRUZ_RECYCLING_INFO = `
# SANTA CRUZ COUNTY RECYCLING CLASSIFICATION

## RECYCLABLE (BLUE BIN)

**METAL:** Aerosol cans (empty), aluminum foil/pans, beverage cans, car parts (small), doors/screens, electrical motors, food/soup cans, furniture, hangers (metal), keys, lids/caps (metal), nuts/bolts, paint cans (dry), pet food cans, pipes, plumbing fixtures, pots/pans, propane/gas tanks (empty), scrap metal, sporting goods, tools, toys, umbrellas, utensils, windows (uncoated/unlaminated)

**GLASS:** Beverage bottles, broken glass, dishware, food jars, wine bottles

**PAPER:** Aseptic packaging, books, carbonless paper, cardboard (unwaxed/flattened), cereal/cracker boxes, coffee cups, colored/construction paper, computer paper, coupons, egg cartons (cardboard), envelopes (plastic window OK), frozen food packaging, gift wrap (no foil), junk mail, juice boxes/cartons, magazines, mailers, milk cartons, newspaper (clean w/ inserts), office paper, paper bags, paper cups/plates (clean, uncoated), photographs, pizza boxes (clean), shoe boxes, shredded paper, telephone books, tissue paper

**PLASTIC:** Auto parts (plastic), baby wipe containers, baskets, beverage bottles, bleach/detergent bottles, buckets, coat hangers, coffee-cup lids, coolers, crates, disposable razors, flower pots, food containers, furniture, gloves (rubber, not latex), hoses, household cleaner bottles (non-toxic), mouthwash, pet carriers, pipe (non-PVC), plastics #1-7, prescription bottles (empty), shampoo/conditioner bottles, shelving, shopping bags, squeezable bottles, swimming pools (rigid/inflatable), take-out containers, toys, umbrellas, utensils

**FILM PLASTICS:** Bundle in clear bag. Bread bags, bubble wrap, cellophane bags, dry cleaning bags, frozen food bags/pouches, newspaper bags, pallet wrap, plastic liners, plastic wraps, produce bags, shrink wrap

**E-WASTE:** Appliances (small), calculators, cameras, cell phones, computer mice, computer towers, cords (tied), DVRs/VCRs/DVD players, fax machines, inkjet/toner cartridges, keyboards, microwaves, pagers, PDAs, printers, radios, scanners, stereos, telephones

---

## GARBAGE (BLACK BIN)

**GLASS:** Blue glass, ceramics, cookware (glass/Pyrex), dishware (ceramic), eye glasses, glass art, mirrors

**PAPER:** Blueprint, carbon, cardboard (waxed/soiled), envelopes (padded/Tyvek), ice cream cartons, newspaper (dirty/w/ paint/pet waste), paper cups/plates (coated), paper napkins, thermal fax, waxed paper

**PLASTIC:** Chip bags, credit cards, foil beverage pouches, gloves (latex), pipes (PVC), rubber bands, shoes, straws, take-out containers (styrofoam), toothpaste tubes, utensils (plastic), webbing/mesh

**POLYSTYRENE/STYROFOAM:** Cups, plates, egg cartons (molded foam), foam packing, meat trays (molded)

**FABRICS/TEXTILES:** Boots, burlap, carpet/rugs, cloth, diapers, clothing accessories, down-filled items, electric blankets, fabrics (w/ chemicals/oil/paint), leather, linen, pillows, polyester, rayon, rubber, shoes, stuffed animals, vinyl, wool

**E-WASTE:** Audio/video tapes, CDs, DVDs, speakers

**FOOD:** Bones, bread, coffee grounds, corks, dairy products, dough, eggs, filters, fish, fruits, grains, meat, pasta, poultry, shellfish, tea bags, vegetables

**YARD:** (Green bin - but goes here if contaminated) Ashes (cold only), bamboo, burlap, construction lumber (painted/treated), crates (wood), dirt, food scraps, lumber (painted/treated), manure, pet waste, pampas grass, poison oak, rocks, soil, tan bark, wood chips, wood waste

---

## YARD WASTE (GREEN BIN)

Branches (cut to fit), cactus, Christmas trees (no stand/decorations), flax, flowers, grass clippings, hay, ivy, ice plant, landscape vegetation, leaves, lumber (unpainted), plant trimmings, raw fruits/vegetables, sawdust, shrubs, small prunings, sod (remove soil), stumps, succulents, tree trimmings, yucca

**Size limit:** ≤3 feet length OR ≤6 inches diameter

---

## HAZARDOUS (DO NOT RECYCLE)

Auto/brake fluids, car batteries, cleaning fluids, computers, e-waste (most), fire extinguishers, fluorescent bulbs, fuel tanks (with valve), grease/cooking oil, household batteries, medicines, mercury thermostats, monitors, motor oil, oil filters, paints/stains, pesticides, pool chemicals, solvents, syringes, televisions, transmission fluid

---

## KEY PREP RULES
- Empty and rinse all food/product containers (metal, glass, plastic)
- Remove excess paint from cans, let dry
- Tie cords together
- Remove liners from cereal boxes
- Film plastics: bundle in clear bag, knot top
- Shredded paper: tie in clear plastic bag
- All items must fit in bin with lid closed; oversized items need appointment

---

## SPECIAL NOTES
- **Metal with fluids:** Not accepted (drain completely)
- **Waxed/soiled cardboard:** Goes to garbage, not recycling
- **Styrofoam:** Always garbage, never recycles
- **PVC pipe:** Garbage only
- **Contamination risk:** Clean items prevent contamination
`;

export const APP_CONFIG = {
  name: 'Recycle Buddy API',
  version: '1.0.0',
  location: 'Santa Cruz, California',
};

export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
};
