// skills.ts — Pawgress full skill library
// All 80+ skills across 8 tracks with 5 levels each.

export type TrackId =
  | "foundation"
  | "family-pet"
  | "socialization"
  | "therapy-dog"
  | "service-dog"
  | "agility"
  | "esa"
  | "tricks";

export interface SkillLevel {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  duration: string;
  distractions: string;
  distance: string;
  criteria: string;
  coachingTip: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  track: TrackId;
  minAgeWeeks: number;
  prerequisites: string[];
  description: string;
  levels: SkillLevel[];
  tip: string;
}

// ─── Level templates ──────────────────────────────────────────────────────────

const LEVEL_NAMES = ["Introduced", "Practicing", "Solid", "Fluent", "Mastered"] as const;

function mkLevels(
  criteria: [string, string, string, string, string],
  tips: [string, string, string, string, string],
  durations: [string, string, string, string, string] = ["2-3 min", "3-5 min", "5-10 min", "10-15 min", "15-20 min"],
  distractions: [string, string, string, string, string] = ["None", "Minimal", "Low (1-2)", "Moderate (3-4)", "High (real-world)"],
  distances: [string, string, string, string, string] = ["Close (1-3 ft)", "Close (1-5 ft)", "Moderate (5-15 ft)", "Distance (15-30 ft)", "Long distance (30+ ft)"],
): SkillLevel[] {
  return [1, 2, 3, 4, 5].map((n) => ({
    level: n as 1 | 2 | 3 | 4 | 5,
    name: LEVEL_NAMES[n - 1],
    duration: durations[n - 1],
    distractions: distractions[n - 1],
    distance: distances[n - 1],
    criteria: criteria[n - 1],
    coachingTip: tips[n - 1],
  }));
}

// ─── Foundation Track (F1-F10) ────────────────────────────────────────────────

const FOUNDATION_SKILLS: Skill[] = [
  {
    id: "F1",
    name: "Name Recognition",
    category: "Foundation",
    track: "foundation",
    minAgeWeeks: 8,
    prerequisites: [],
    description: "Dog looks at you when their name is called — the foundational attention cue.",
    levels: mkLevels(
      ["Looks when name said, no distraction", "Looks from 5 ft away", "Looks from across room with 1 distraction", "Looks outside with people present", "Looks anywhere, any distraction"],
      ["Say the name once in a happy tone. Mark and treat the moment they glance. Never repeat the name — use a kissy noise if needed.", "If dog doesn't look, walk away and try again in 30 seconds. Your movement makes you interesting.", "Generalize — practice in kitchen, living room, backyard. Same cue, different place is harder than you think.", "Use higher-value treats outdoors. Kibble won't compete with the real world.", "Maintain the name's value with occasional jackpots. Keep it magical."],
    ),
    tip: "Never say the name before something unpleasant (bath, vet). The name should always mean good things are coming.",
  },
  {
    id: "F2",
    name: "Eye Contact",
    category: "Foundation",
    track: "foundation",
    minAgeWeeks: 8,
    prerequisites: ["F1"],
    description: "Dog holds eye contact on cue — the foundation of communication and check-ins.",
    levels: mkLevels(
      ["Holds eye contact 2 sec", "5 sec, no lure", "10 sec with movement nearby", "15 sec in new environment", "20+ sec anywhere"],
      ["Hold a treat at eye level. When eyes meet yours, mark and treat. Don't stare intensely — soft, relaxed eye contact.", "Put treats in a pocket. Wait for offered eye contact, then mark and treat. The answer is your face, not your hand.", "Practice while walking — stop, wait for eye contact, then continue. Continuation is the reward.", "In high-distraction environments, accept shorter glances at first. Build back up to duration.", "Reward check-ins forever, even intermittently. This keeps the behavior strong for life."],
    ),
    tip: "Hard staring can feel threatening. Keep eye contact soft and relaxed.",
  },
  {
    id: "F3",
    name: "Sit",
    category: "Foundation",
    track: "foundation",
    minAgeWeeks: 8,
    prerequisites: ["F1", "F2"],
    description: "Dog sits on cue — the most useful default behavior. Replaces jumping, begging, door-bolting.",
    levels: mkLevels(
      ["Lured into sit", "Verbal 'sit,' no hand lure", "Sit with 1 distraction, 5 ft away", "Sit outside, 15 ft away", "Sit anywhere, first cue"],
      ["Hold treat above nose, move slowly back toward tail. As head goes up, butt goes down. Mark the moment butt hits floor.", "Fade the lure — use empty hand motion, treat from other hand. Add verbal 'sit' as they go down.", "Dogs don't generalize. Practice in different rooms, then outdoors. Sit from a standing position.", "If dog breaks sit to investigate a distraction, don't repeat the cue. Wait. When they sit again, mark and treat.", "Proof the sit against everything: balls rolling past, food on ground, doors opening, other dogs approaching."],
    ),
    tip: "Don't push the butt down — let the lure do the work. Pushing teaches them to resist pressure.",
  },
  {
    id: "F4",
    name: "Down",
    category: "Foundation",
    track: "foundation",
    minAgeWeeks: 10,
    prerequisites: ["F3"],
    description: "Dog lies down on cue — a calmer position that reduces reactivity.",
    levels: mkLevels(
      ["Lured into down", "Verbal 'down'", "Down with 1 distraction", "Down in new environment", "Down anywhere, under distraction"],
      ["From a sit, lure treat from nose straight down to floor, then pull forward. Dog follows, elbows hit floor. Mark and treat.", "Fade lure — empty hand motion, treat from other hand. Add verbal 'down.' Practice from a stand too.", "Down on grass is harder than on floor. Use a mat outdoors at first, then fade the mat.", "Down at a distance is easier with a 'place' mat. Send to mat, then ask for down.", "A dog that will down in a chaotic environment is a dog you can take anywhere."],
    ),
    tip: "Don't use 'down' for 'get off the couch' — use 'off' for that. Each word means one thing.",
  },
  {
    id: "F5",
    name: "Stay",
    category: "Foundation",
    track: "foundation",
    minAgeWeeks: 12,
    prerequisites: ["F3", "F4"],
    description: "Dog holds position until released — impulse control that prevents bolting.",
    levels: mkLevels(
      ["3 sec, close", "10 sec, 5 ft", "30 sec, 15 ft, 1 distraction", "2 min, 20 ft, 3 distractions", "5 min, 30+ ft, real-world"],
      ["Ask for sit. Say 'stay' with flat palm. Take ONE step back. Count to 3. Return to dog, mark and treat. Always return to treat.", "Increase duration OR distance, not both at once. Make one harder, keep the other easy.", "Don't stare at the dog during stay — it feels like pressure. Look away, glance at phone, check back.", "If dog breaks, don't scold. Silently reset, make it slightly easier. End on a success.", "Out-of-sight stays are the ultimate test. Start with 5 seconds around a corner, build slowly."],
    ),
    tip: "Always return to the dog to treat, never call them to you. Returning teaches holding. Calling teaches breaking.",
  },
  {
    id: "F6",
    name: "Come (Recall)",
    category: "Foundation",
    track: "foundation",
    minAgeWeeks: 10,
    prerequisites: ["F1"],
    description: "Dog comes when called — the most important safety skill.",
    levels: mkLevels(
      ["Comes from 3 ft", "Comes from 10 ft, no distraction", "Comes from 20 ft, low distraction", "Comes from 30 ft, moderate distraction", "Comes anywhere, high distraction"],
      ["Say '[Name], come!' in happy voice. Squat down, open arms. When dog arrives, mark and give jackpot (3-4 treats).", "Don't chase the dog. Run AWAY — dogs love a chase, and you want them chasing you.", "Use a specific recall word exclusively for formal recall. 'Come' is too casual.", "Practice 'catch and release' — call, reward, then release to play again. Coming to you shouldn't end the fun.", "Maintain recall reliability by practicing weekly for life and always rewarding."],
    ),
    tip: "NEVER punish a dog for coming to you, even if they took 10 minutes. Coming to you must ALWAYS be the best decision.",
  },
  {
    id: "F7",
    name: "Leave It",
    category: "Foundation",
    track: "foundation",
    minAgeWeeks: 12,
    prerequisites: [],
    description: "Dog ignores items on cue — prevents poisoning, scavenging, and eating dangerous objects.",
    levels: mkLevels(
      ["Sniffs then looks away from closed fist", "Doesn't touch treat on open palm", "Walks past item on floor", "Ignores food on ground outside", "Leaves anything, anywhere"],
      ["Place low-value treat in closed fist. Dog sniffs, licks, paws. The moment they pull away, mark and treat from OTHER hand (high-value).", "Don't yank the treat away — let the dog make the choice to leave it. You want them deciding.", "The floor treat is a decoy — never let them eat it. Always reward from your hand.", "Real-world leave it is life-saving. Practice with fake dangerous items (medication simulators, chicken bones).", "Make 'leave it' a reflex. The dog should hear the words and disengage before processing what the thing is."],
    ),
    tip: "The reward for leaving it is always better than the thing they left. Kibble in fist, cheese in reward hand.",
  },
  {
    id: "F8",
    name: "Drop It",
    category: "Foundation",
    track: "foundation",
    minAgeWeeks: 12,
    prerequisites: [],
    description: "Dog releases items from mouth on cue — gets dangerous items out without a fight.",
    levels: mkLevels(
      ["Releases toy for treat", "Releases high-value item", "Releases on verbal only", "Drops item on cue with distraction", "Drops anything immediately"],
      ["Let dog have a toy. Hold high-value treat at nose. Say 'drop it.' When they open mouth, mark, take toy, give treat. Give toy back.", "Always give the item back at first. This teaches: dropping doesn't mean losing it forever. Reduces possessiveness.", "Transition from 'treat visible' to 'treat appears after.' You want the cue to work, not the treat.", "Play tug as training game — 'drop it' ends the game, then restart. Makes drop it fun rather than punitive.", "Maintenance: practice drop it weekly for life. It's a safety skill that degrades if unused."],
    ),
    tip: "If dog guards items (growls, freezes, snaps), STOP and consult a trainer. Resource guarding needs professional help.",
  },
  {
    id: "F9",
    name: "Loose Leash Walk",
    category: "Foundation",
    track: "foundation",
    minAgeWeeks: 12,
    prerequisites: ["F3"],
    description: "Dog walks without pulling — enjoyable and safe walks for both of you.",
    levels: mkLevels(
      ["30 sec no pulling indoors", "1 min no pulling, 1 turn", "5 min, outside, minimal distraction", "10 min, crowd, polite", "15+ min, anywhere, no pulling"],
      ["A pulling dog gets nothing — no forward movement. The moment there's slack, forward movement resumes.", "Be unpredictable. Change direction randomly. Dog learns to watch you to know where you're going.", "Use a front-clip harness for pullers. It makes pulling uncomfortable so they self-correct.", "Don't yank the leash. Pressure teaches dog to pull against it (opposition reflex). Let stopping/turning do the teaching.", "Loose leash is a forever skill. Reward occasionally for position. If pulling creeps back, do 'penalty yards' sessions."],
    ),
    tip: "The leash is a brake, not a steering wheel. Let the stopping and turning do the teaching.",
  },
  {
    id: "F10",
    name: "Settle / Place",
    category: "Foundation",
    track: "foundation",
    minAgeWeeks: 12,
    prerequisites: ["F4"],
    description: "Dog goes to a mat and relaxes — teaches an off switch and a designated spot.",
    levels: mkLevels(
      ["Goes to mat, 10 sec", "Stays on mat 1 min", "Stays 5 min, 1 distraction", "Stays 10 min, new environment", "Stays 15+ min, full distraction"],
      ["Place mat on floor. Lure dog onto mat. Mark when all four paws on. Lure into down. Wait 10 sec. Release with 'okay.'", "Don't always release immediately. Sometimes sit with them. Settle is about duration and calm, not just getting to mat.", "Practice settle during daily life — while cooking, eating, working. Real-life usage is better than training sessions.", "Take the mat to cafes, outdoor events, friends' houses. The mat becomes a portable home base.", "A dog that settles on a mat under a restaurant table is a dog that gets invited back."],
    ),
    tip: "The mat is the dog's safe zone. Good things happen on the mat. Never send them to mat as punishment.",
  },
];

// ─── Family Pet Track (FP1-FP8) ───────────────────────────────────────────────

const FAMILY_PET_SKILLS: Skill[] = [
  {
    id: "FP1",
    name: "No Jumping",
    category: "Family Pet",
    track: "family-pet",
    minAgeWeeks: 10,
    prerequisites: ["F3"],
    description: "Dog keeps four on the floor when greeting — the #1 visitor complaint solved.",
    levels: mkLevels(
      ["Doesn't jump when greeted (treat redirect)", "Sits when approached", "Sits for visitors at door", "Sits for strangers in public", "Never jumps, self-regulates"],
      ["If dog jumps, turn your back and cross arms. The moment four paws hit floor, mark and treat. ANY attention while jumping is attention.", "Ask for a sit before greeting. Guest approaches only when sitting. If dog breaks sit, guest retreats.", "Manage the environment — use a leash on the door handle so dog can't reach the door.", "Ask strangers to only pet if dog is sitting. If dog jumps, person walks away. Most people cooperate if you explain.", "Consistency from everyone in the household is critical. If one person allows jumping, it will persist."],
    ),
    tip: "The only response to jumping is total silence and back-turning. Four paws = party.",
  },
  {
    id: "FP2",
    name: "Door Manners",
    category: "Family Pet",
    track: "family-pet",
    minAgeWeeks: 12,
    prerequisites: ["F3", "F5"],
    description: "Dog waits at thresholds instead of bolting — keeps dogs safe at doors, gates, and cars.",
    levels: mkLevels(
      ["Doesn't bolt through door", "Waits at open door 3 sec", "Waits until released through door", "Waits at car door", "Waits at any threshold, released on cue"],
      ["Put dog on leash. Ask for sit. Open door 1 inch. If dog moves toward door, close it. When dog holds sit, mark and treat.", "The door closing is the consequence, not a verbal 'no.' The door itself does the teaching.", "Practice car doors especially — dogs bolting from cars is a major risk. Dog should wait until leash is on and you give release.", "The doorbell is a trigger — pair it with 'sit and wait' until it becomes the default response.", "This becomes a habit, not a cued behavior. The dog should pause at every threshold without being told."],
    ),
    tip: "Use a release word consistently — 'okay,' 'free,' 'let's go.' Same word every time.",
  },
  {
    id: "FP3",
    name: "Polite Greeting",
    category: "Family Pet",
    track: "family-pet",
    minAgeWeeks: 12,
    prerequisites: ["FP1"],
    description: "Dog approaches slowly, doesn't mouth, and allows extended petting — welcome everywhere.",
    levels: mkLevels(
      ["Sniffs hand, doesn't mouth", "Doesn't jump on person", "Allows petting without excitement", "Sits for petting from stranger", "Calm greeting, any person, any setting"],
      ["Approach dog calmly. If they mouth, redirect to a toy. Mark for gentle interaction.", "Same as No Jumping but adds: dog approaches slowly, doesn't mouth, allows extended petting.", "Practice with different people — tall, short, kids, excited people. Dog sits for petting.", "Dogs need to adapt approach to the individual. A loud greeting fine for a teen might scare a nursing home resident.", "Dog adapts approach to person's mobility and reads body language — stops approaching if person is nervous."],
    ),
    tip: "Kids are the hardest test — they're at face level and exciting. Practice with calm children first.",
  },
  {
    id: "FP4",
    name: "Crate Manners",
    category: "Family Pet",
    track: "family-pet",
    minAgeWeeks: 8,
    prerequisites: [],
    description: "Dog enters crate willingly and stays calm — a safe space and prevents destructive behavior.",
    levels: mkLevels(
      ["Enters crate willingly", "Stays in crate 5 min, quiet", "30 min, quiet, door closed", "2 hours, quiet", "Overnight + travel, calm"],
      ["Toss treats into open crate. Dog goes in, eats, comes out. Repeat. Don't close door yet. Feed meals in crate. Never force the dog in.", "If dog whines, wait for a moment of quiet before opening. Opening while whining teaches: whining = freedom.", "Build to 30 minutes with a Kong or chew. Practice while you're in the room, then in the next room.", "Vary the routine so crate time isn't always 'leaving the house.' Sometimes crate = you're right there, relaxing.", "The crate should be the dog's bedroom — always available, door open when not in use. They should choose to nap there."],
    ),
    tip: "Never force the dog in. Let them choose. The crate is a magic treat box, not a prison.",
  },
  {
    id: "FP5",
    name: "Meal Manners",
    category: "Family Pet",
    track: "family-pet",
    minAgeWeeks: 12,
    prerequisites: ["F5"],
    description: "Dog waits for food bowl on cue — impulse control around food prevents begging and food aggression.",
    levels: mkLevels(
      ["Waits for food bowl 3 sec", "Waits until released", "Waits with person 10 ft away", "Waits with distraction in room", "Waits until released, any condition"],
      ["Place food bowl down, say 'wait' or 'stay.' Dog holds position. Release with 'okay.' If dog goes for food, lift bowl and reset.", "Hand-feeding for the first 2 weeks builds food manners faster than any training exercise.", "Increase distance gradually. Dog learns to wait even when you're not right next to the bowl.", "Add distractions — another person walking by, a toy on the floor. Dog should hold the wait.", "Dog waits under any condition until released. This is about respect and impulse control."],
    ),
    tip: "Hand-feeding for the first 2 weeks builds food manners faster than any training exercise.",
  },
  {
    id: "FP6",
    name: "Quiet on Cue",
    category: "Family Pet",
    track: "family-pet",
    minAgeWeeks: 14,
    prerequisites: ["F1"],
    description: "Dog stops barking on cue — excessive barking is a top reason dogs are surrendered.",
    levels: mkLevels(
      ["Acknowledges 'quiet'", "Stops barking within 5 sec", "Stops barking with trigger present", "Quiet in public setting", "Self-regulates, rarely needs cue"],
      ["Acknowledge bark, say 'quiet,' treat when silent (even for 1 second). Mark the silence.", "Don't yell 'QUIET!' — dog thinks you're barking too. Whisper the cue. Calm energy = calm dog.", "The transition is: trigger present, dog barks, 'quiet' cue, dog stops. Reward generously.", "Practice in increasingly distracting environments. Dog should respond to 'quiet' anywhere.", "Dog self-regulates and rarely needs the cue. Barking decreases naturally as impulse control improves."],
    ),
    tip: "Don't yell 'QUIET!' — dog thinks you're barking too. Whisper the cue. Calm energy = calm dog.",
  },
  {
    id: "FP7",
    name: "Off Furniture",
    category: "Family Pet",
    track: "family-pet",
    minAgeWeeks: 10,
    prerequisites: ["F3"],
    description: "Dog gets off furniture on cue and stays off unless invited.",
    levels: mkLevels(
      ["Gets off when asked", "Stays off with cue", "Stays off when food is on couch", "Stays off in all rooms", "Never gets on furniture uninvited"],
      ["Lure dog off couch with treat. Say 'off' as they get down. Mark and treat on the floor.", "If you want dog on furniture sometimes, teach 'up' as the invitation. 'Off' means get down.", "Practice with food on the couch — the ultimate temptation. Dog should hold 'off' even with food present.", "Practice in all rooms. Dog should understand 'off' applies to all furniture everywhere.", "Dog never gets on furniture uninvited. Everyone in the household must enforce the rule."],
    ),
    tip: "If you want the dog on furniture sometimes, teach 'up' as the invitation. 'Off' means get down.",
  },
  {
    id: "FP8",
    name: "Vacuum / Appliance Calm",
    category: "Family Pet",
    track: "family-pet",
    minAgeWeeks: 12,
    prerequisites: [],
    description: "Dog stays calm around household appliances — no more fleeing from the vacuum.",
    levels: mkLevels(
      ["Doesn't flee from vacuum (off)", "Stays in room with vacuum on, 10 ft", "Stays calm, vacuum passing nearby", "Stays calm, vacuum around them", "Lies down while vacuuming around them"],
      ["Desensitize gradually. Treat for calm behavior near the vacuum when it's off. Never force the dog to stay.", "Turn vacuum on briefly, treat. Increase duration. Let the dog choose to remain at a comfortable distance.", "Pair vacuum with high-value treats. Vacuum appears = treat. This creates positive associations.", "Gradually close the distance. Dog should be calm even when vacuum passes right by them.", "Dog lies down while vacuuming around them. Completely unbothered by household appliances."],
    ),
    tip: "Never force the dog to stay — let them choose to remain at a comfortable distance, gradually closing it.",
  },
];

// ─── Socialization Track ──────────────────────────────────────────────────────

const SOCIALIZATION_SKILLS: Skill[] = [
  {
    id: "SOC1",
    name: "People Exposure",
    category: "Socialization",
    track: "socialization",
    minAgeWeeks: 8,
    prerequisites: [],
    description: "Positive exposure to different types of people — men, women, children, toddlers, beards, hats, sunglasses, hoodies, uniforms, mobility aids.",
    levels: mkLevels(
      ["1 type of person, calm exposure", "3 types of people, positive reaction", "6 types of people, confident", "10+ types of people, confident", "All types of people, any setting, confident"],
      ["Start with calm adults. Let dog approach at their pace. Pair with treats. Never force exposure.", "Add variety — hats, beards, sunglasses. Each new type = treat. Dog learns: new people mean good things.", "Add children and toddlers (supervised). Kids are exciting — start with calm kids, then energetic ones.", "Add uniforms, mobility aids (canes, walkers, wheelchairs). Dog should be curious, not fearful.", "Dog is confident with all types of people in any setting. Socialization is complete for this category."],
    ),
    tip: "Never force exposure. Let the dog approach at their pace. Pair everything with food.",
  },
  {
    id: "SOC2",
    name: "Dog Socialization",
    category: "Socialization",
    track: "socialization",
    minAgeWeeks: 8,
    prerequisites: [],
    description: "Positive exposure to different dogs — vaccinated adults, puppies, large dogs, small dogs, calm dogs, energetic dogs.",
    levels: mkLevels(
      ["1 calm vaccinated adult dog", "3 different dogs, positive interaction", "5 different dogs, varied sizes", "10+ dogs, varied energy levels", "Confident with any dog, appropriate play"],
      ["Start with one calm, vaccinated adult dog. Controlled introduction in neutral territory.", "Add variety — different sizes, ages. Watch body language. Separate if either dog is uncomfortable.", "Large and small dogs together needs supervision. Prey drive can be triggered by small dogs running.", "Dog should read other dogs' body language and adjust play style appropriately.", "Dog is confident, plays appropriately, and can be called away from play. Goal: 10+ positive exposures total."],
    ),
    tip: "Watch body language. If either dog is uncomfortable, increase distance. Quality over quantity.",
  },
  {
    id: "SOC3",
    name: "Environment Exposure",
    category: "Socialization",
    track: "socialization",
    minAgeWeeks: 8,
    prerequisites: [],
    description: "Positive exposure to different surfaces and environments — grass, concrete, carpet, tile, gravel, sand, busy street, park, pet store, vet lobby.",
    levels: mkLevels(
      ["2 new surfaces, walks on them", "5 surfaces + 2 new environments", "8 surfaces + 4 environments", "10+ surfaces + 6 environments", "Confident in any environment, any surface"],
      ["Start with safe surfaces — grass, carpet. Pair with treats. Dog should walk on the surface willingly.", "Add concrete, tile, gravel. Each new surface = treat. Dog learns: new ground is safe.", "Add environments — quiet park, friend's home, car ride (non-vet). Vet lobby happy visit — treats, no shots.", "Add busy street (carried if not vaccinated), pet-friendly store. Dog should be curious, not overwhelmed.", "Dog is confident in any environment. Continues socialization through adolescence and adulthood."],
    ),
    tip: "Vet lobby happy visits — go to vet, give treats in lobby, leave. No shots. Vet = good place.",
  },
  {
    id: "SOC4",
    name: "Sound Desensitization",
    category: "Socialization",
    track: "socialization",
    minAgeWeeks: 8,
    prerequisites: [],
    description: "Positive exposure to different sounds — vacuum, doorbell, knocking, thunder, fireworks, traffic, dogs barking, music, crying baby.",
    levels: mkLevels(
      ["1 new sound at low volume, no fear", "3 sounds at normal volume, calm", "6 sounds, calm, treats paired", "10+ sounds, confident, recovers fast", "Any sound, no startle, recovers instantly"],
      ["Start at low volume. Pair with treats. Sound = treat. Never force — let dog retreat if needed.", "Increase volume gradually. Dog should be calm, not just tolerating.", "Pair each sound with high-value treats. Dog learns: scary sounds mean good things happen.", "Add recordings of thunder, fireworks. Start quiet, build up. Dog should recover within seconds.", "Dog is confident with any sound. Recovers instantly from startle. No noise phobias."],
    ),
    tip: "If dog shows fear, increase distance from sound source. Distance is your friend.",
  },
  {
    id: "SOC5",
    name: "Object Socialization",
    category: "Socialization",
    track: "socialization",
    minAgeWeeks: 8,
    prerequisites: [],
    description: "Positive exposure to novel objects — umbrellas, cardboard boxes, balloons, strollers, shopping carts, bicycles, skateboards.",
    levels: mkLevels(
      ["1 novel object, sniffs it", "3 objects, approaches willingly", "6 objects, confident", "10+ objects, curious and calm", "Any object, confident, no fear"],
      ["Place object in room. Let dog approach at their pace. Treat for any investigation.", "Add movement — umbrella opening, stroller moving. Pair with treats. Dog should approach, not flee.", "Add bicycles, skateboards (stationary first, then moving slowly). Dog should be curious.", "Dog confidently approaches any new object. No hesitation or fear responses.", "Dog is confident with any novel object. No startle, no fear, curious approach."],
    ),
    tip: "Never force the dog toward a scary object. Let them choose to approach. Treat for courage.",
  },
  {
    id: "SOC6",
    name: "Handling & Touch",
    category: "Socialization",
    track: "socialization",
    minAgeWeeks: 8,
    prerequisites: [],
    description: "Dog accepts handling — paws touched, ears examined, mouth opened, tail touched, full-body pet, lifted off ground, vet exam simulation.",
    levels: mkLevels(
      ["Paws touched, allows it", "Paws + ears examined, calm", "Full-body handling, calm", "Vet exam simulation, calm", "Full vet-style exam, any handler, calm"],
      ["Touch paw, treat. Release. Gradually hold paw longer. Pair all handling with food.", "Add ear exam — lift ear flap, look inside, treat. Add mouth open — gentle, treat.", "Full-body pet, tail touch, lift dog slightly. All paired with treats. Dog should be relaxed.", "Simulate vet exam — thermometer (fake), stethoscope (real), full body palpation. Treat throughout.", "Dog is calm for any handler — vet, groomer, stranger. No bite inhibition issues during handling."],
    ),
    tip: "Pair all handling with food from day one. Dog learns: being touched = good things happen.",
  },
];

// ─── Therapy Dog Track (T1-T17) ───────────────────────────────────────────────

const THERAPY_DOG_SKILLS: Skill[] = [
  {
    id: "T1",
    name: "Accepting Friendly Stranger",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["F1", "F3"],
    description: "CGC Test 1: Dog allows stranger to approach and handler shakes hands with stranger.",
    levels: mkLevels(
      ["Allows stranger approach indoors", "Same, outdoors", "Evaluator handshake simulation", "Multiple strangers, public", "Any stranger, any setting"],
      ["Start with friends approaching. Dog sits, person approaches, shakes your hand. Dog should be calm.", "Move outdoors. Same exercise with strangers in a park or public space.", "Simulate the CGC test — evaluator approaches, shakes hand, dog stays sitting and calm.", "Practice with multiple strangers approaching in sequence. Dog should not break sit.", "Dog is calm with any stranger approaching in any environment. CGC-ready."],
    ),
    tip: "Dog should sit politely and not break position when stranger approaches. No jumping, no shyness.",
  },
  {
    id: "T2",
    name: "Polite Petting",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["T1"],
    description: "CGC Test 2: Dog sits calmly for petting from a stranger (head and body).",
    levels: mkLevels(
      ["Sits for petting from friend", "Sits for stranger petting head", "Sits for full-body petting", "Sits for 30 sec continuous petting", "Calm through extended petting"],
      ["Friend approaches, asks dog to sit, pets head and body. Treat for calm. Dog should not mouth or wiggle.", "Stranger approaches, pets head. Dog sits. If dog gets excited, person stops. Resume when calm.", "Full-body petting — back, sides, chest. Dog should accept all touch calmly.", "30 seconds of continuous petting from stranger. Dog remains sitting and relaxed.", "Dog is calm through extended petting (2+ minutes). Ready for therapy visits where everyone pets."],
    ),
    tip: "Therapy dogs get petted a LOT. Dog must tolerate clumsy, awkward, repetitive petting without annoyance.",
  },
  {
    id: "T3",
    name: "Appearance & Grooming",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["SOC6"],
    description: "CGC Test 3: Dog allows stranger to brush/inspect ears and paws.",
    levels: mkLevels(
      ["Allows brush/groom for 1 min", "Allows ear + paw exam by friend", "Allows stranger to brush + examine", "Full exam by stranger, new environment", "Calm through full vet-style exam"],
      ["Brush dog gently for 1 minute. Treat for calm. Dog should not squirm or snap.", "Friend examines ears (lifts flap), holds paw. Dog stays calm. Pair with treats.", "Stranger brushes dog, examines ears and paws. Dog should be cooperative, not fearful.", "Full exam by stranger in new environment — outside, at a friend's house.", "Dog is calm through full vet-style exam by anyone, anywhere. CGC-ready."],
    ),
    tip: "Practice grooming handling daily. Dog should associate brush and touch with positive experiences.",
  },
  {
    id: "T4",
    name: "Loose Leash Walk (CGC)",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["F9"],
    description: "CGC Test 4: Dog walks on loose leash through a course with turns and stops.",
    levels: mkLevels(
      ["1 min, 1 turn indoors", "5 min, turns + stop outdoors", "Full CGC course pattern", "Same with 3+ distractions", "Heel anywhere, any course"],
      ["Walk in straight line, make one turn. Dog stays at your side, no pulling.", "Add stops, about-turns, figure-8s. Dog should follow without pulling or lagging.", "Full CGC course: walk, turn right, turn left, about-turn, stop, figure-8 around two people.", "Same course with 3+ distractions — people walking by, food on ground.", "Dog heels anywhere, any course pattern, with any distractions. CGC-ready."],
    ),
    tip: "CGC course includes a figure-8 around two people. Practice with friends standing as posts.",
  },
  {
    id: "T5",
    name: "Walking Through Crowd",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["T4"],
    description: "CGC Test 5: Dog walks through a crowd of people without pulling or showing shyness.",
    levels: mkLevels(
      ["Walks past 1 person", "Walks past 3 people", "Walks through crowd of 5+", "Dense crowd, no pulling", "Crowded event, calm and focused"],
      ["Walk past one person on sidewalk. Dog should not pull toward or away from person.", "Walk past 3 people. Dog stays at your side, no greeting unless released.", "Walk through a crowd of 5+ people. Dog should be calm, no pulling, no shyness.", "Dense crowd — farmer's market, busy sidewalk. Dog stays close, focused on handler.", "Crowded event — festival, fair. Dog is calm, focused on handler, no stress signals."],
    ),
    tip: "Dog should not show fear or aggression in crowds. If overwhelmed, increase distance and build up slowly.",
  },
  {
    id: "T6",
    name: "Sit/Down + Stay (CGC)",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["F5"],
    description: "CGC Test 6: Dog does sit and down on cue, then stays on 20-ft line.",
    levels: mkLevels(
      ["Sit + down, 3 sec stay", "20 ft line, 10 sec stay", "20 ft line, 30 sec stay", "20 ft line, 1 min, distraction", "20 ft line, 3 min, full distraction"],
      ["Ask for sit, then down. Dog should respond to both cues. Brief 3-sec stay at close range.", "Attach 20-ft line. Walk 10 ft away, count to 10, return to dog. Dog holds position.", "Same setup, 30 seconds. Dog should not break position when you walk away.", "Add distraction — person walks by, ball rolls past. Dog holds stay for 1 minute.", "3-minute stay with full distraction on 20-ft line. CGC-ready."],
    ),
    tip: "Always return to the dog to treat. Never call them to you from a stay during CGC testing.",
  },
  {
    id: "T7",
    name: "Come When Called (CGC)",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["F6"],
    description: "CGC Test 7: Dog comes when called from 20 ft away on a long line.",
    levels: mkLevels(
      ["Comes from 10 ft on line", "Comes from 20 ft on line", "Comes from 20 ft, mild distraction", "20 ft, moderate distraction", "20 ft, high distraction, first call"],
      ["Have someone hold dog. Walk 10 ft away. Call 'come!' Dog should come directly to you.", "Increase to 20 ft on long line. Dog should come directly, no detours.", "Add mild distraction — toy on ground nearby. Dog should come when called.", "Moderate distraction — person walking by. Dog comes on first call.", "High distraction — another dog visible. Dog comes immediately on first call. CGC-ready."],
    ),
    tip: "Recall should always be rewarded generously. Never call dog for something unpleasant.",
  },
  {
    id: "T8",
    name: "Reaction to Another Dog",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["SOC2"],
    description: "CGC Test 8: Dog reacts politely when another dog approaches — no aggression or excessive interest.",
    levels: mkLevels(
      ["Sees dog at 20 ft, no reaction", "Approaches + passes politely", "Handler handshake + pass", "Multiple dogs passing", "Any dog encounter, calm"],
      ["Another dog appears at 20 ft. Your dog should notice but not pull, bark, or lunge.", "Two handlers approach with dogs, shake hands, continue past. Dogs should not greet.", "CGC test: handlers shake hands, dogs pass side by side at 3 ft. No sniffing or pulling.", "Multiple dogs passing in sequence. Dog should remain calm and focused on handler.", "Any dog encounter — dog remains calm, no reactivity. CGC-ready."],
    ),
    tip: "Dogs should NOT greet during this test. They pass each other politely. Practice with a friend's dog.",
  },
  {
    id: "T9",
    name: "Reaction to Distraction",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["SOC4", "SOC5"],
    description: "CGC Test 9: Dog remains confident when faced with common distracting situations.",
    levels: mkLevels(
      ["Notices distraction, recovers", "Recovers in 3 sec", "Chair drop, recovers", "Jogger/dolly passing, calm", "Any distraction, no startle"],
      ["Present a mild distraction — knock on surface. Dog notices but recovers quickly.", "Dog should recover within 3 seconds of any distraction. No prolonged fear reaction.", "Drop a chair or book nearby. Dog may startle but should recover within 3 seconds.", "Jogger runs past, dolly rolls by, skateboard passes. Dog should be calm, not chase or flee.", "Any distraction — dog does not startle or shows minimal startle with instant recovery. CGC-ready."],
    ),
    tip: "Practice startle recovery deliberately but gently. Drop items at increasing volume. Reward calm recovery.",
  },
  {
    id: "T10",
    name: "Supervised Separation",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["F5", "FP4"],
    description: "CGC Test 10: Dog stays calm when handler is out of sight for 3 minutes.",
    levels: mkLevels(
      ["Owner out of sight 30 sec", "1 min, mild whining ok", "3 min, calm", "3 min, new environment", "3+ min, any handler, calm"],
      ["Have someone hold dog's leash. Walk out of sight for 30 sec. Dog should not panic.", "Build to 1 minute. Mild whining is acceptable at this level but not barking or thrashing.", "3 minutes out of sight. Dog should be calm. No whining, barking, or attempts to follow.", "3 minutes in a new environment — friend's house, training class.", "3+ minutes, any handler holds leash, any environment. Dog is completely calm. CGC-ready."],
    ),
    tip: "Start with very short separations. Dog should trust that you always come back. Build duration slowly.",
  },
  {
    id: "T11",
    name: "Lap Sit",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["T2"],
    description: "Dog sits on or near a person's lap for comfort — therapy-specific skill.",
    levels: mkLevels(
      ["Sits near person on chair", "Sits on lap 30 sec", "Stays on lap 2 min", "Lap sit with petting", "Lap sit for 5+ min, calm"],
      ["Lure dog onto your lap while seated. Treat. 30 seconds. Release. Small/medium dogs only (under 40 lbs).", "Dog stays on lap 2 minutes. Add gentle petting. Dog should be relaxed, not squirming.", "Lap sit while you talk to someone else. Dog should settle and relax.", "Lap sit with continuous petting from the person. Dog should be calm and enjoy the contact.", "Lap sit for 5+ minutes in a therapy setting (hospital, school). Dog is completely relaxed."],
    ),
    tip: "Large dogs do 'feet up' (front paws on chair/armrest) instead of full lap sit.",
  },
  {
    id: "T12",
    name: "Gentle Greeting",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["FP3"],
    description: "Dog greets gently, adapting approach to person's mobility and needs.",
    levels: mkLevels(
      ["Approaches person slowly", "Nudges hand, no jumping", "Gentle greeting with elderly/person in chair", "Adapts to person's mobility", "Reads body language, adjusts"],
      ["Approach seated person slowly. Dog should nudge hand gently, no mouthing, no jumping.", "Dog should greet softly — no whining, no excitement. Gentle approach and contact.", "Greet elderly person or someone in a wheelchair. Dog should be extra gentle and calm.", "Dog adapts greeting to person's mobility — gentler for fragile, more for robust.", "Dog reads body language — approaches hesitant people slowly, confident people normally."],
    ),
    tip: "Therapy dogs must adjust energy to the person. A bouncy greeting fine for a teen might scare a nursing home resident.",
  },
  {
    id: "T13",
    name: "Medical Equipment Calm",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["SOC5"],
    description: "Dog is calm around medical equipment — wheelchairs, walkers, beds, IV poles, stretchers.",
    levels: mkLevels(
      ["Sniffs wheelchair/walker", "Calm near equipment 1 min", "Calm with equipment moving", "Bed/wheelchair/stretcher, calm", "Full hospital environment"],
      ["Let dog sniff wheelchair/walker. Treat for calm investigation. Never force close.", "Dog should be calm near stationary equipment for 1 minute. No fear, no fixation.", "Equipment moving toward/past dog. Dog should be calm, not flinch or flee.", "Dog calm near hospital bed, IV pole, stretcher. Should not try to investigate or chew equipment.", "Full hospital environment — beeping machines, rolling carts, medical staff. Dog is completely calm."],
    ),
    tip: "Start with equipment at a distance. Pair with treats. Never force the dog close — let them choose to approach.",
  },
  {
    id: "T14",
    name: "Recovery from Startle",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["T9"],
    description: "Dog recovers quickly from startling events — dropped items, loud noises, sudden movements.",
    levels: mkLevels(
      ["Recovers from clap in 10 sec", "Recovers in 5 sec", "Recovers from dropped item, 3 sec", "Loud noise in new env, instant", "Any startle, instant recovery"],
      ["Clap once. Dog may startle but should recover in 10 seconds. Treat for calm recovery.", "Recovers in 5 seconds. Dog should check in with handler after startle.", "Dropped item (book, metal tray). Dog should recover in 3 seconds and check in.", "Loud noise in new environment. Dog recovers instantly, returns to handler.", "Any startle — dog recovers instantly, returns to handler, resumes working. No lingering anxiety."],
    ),
    tip: "Practice startle recovery deliberately. The key is: startle is fine, recovery is fast, dog checks in with handler.",
  },
  {
    id: "T15",
    name: "Extended Settle",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["F10"],
    description: "Dog settles on mat for extended periods — therapy visits last 30-60 minutes.",
    levels: mkLevels(
      ["On mat 5 min", "On mat 10 min", "On mat 20 min, new room", "On mat 30 min, public", "45+ min, therapy session length"],
      ["Dog on mat for 5 minutes. Handler nearby. Dog should be relaxed.", "Build to 10 minutes. Handler can move around room. Dog should stay settled.", "20 minutes in a new room. Dog should be relaxed (head down, sighing).", "30 minutes in a public setting — lobby, waiting room. Dog settles on mat.", "45+ minutes — full therapy session length. Dog is relaxed and available for visits."],
    ),
    tip: "Therapy visits last 30-60 minutes. The dog needs to settle for the entire visit. Build duration gradually.",
  },
  {
    id: "T16",
    name: "Group Handling",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["T2"],
    description: "Dog stays calm when multiple people pet simultaneously — everyone wants to pet the therapy dog.",
    levels: mkLevels(
      ["1 person pets, calm", "2 people pet simultaneously", "3+ people, calm", "Crowd petting, calm", "Group of 5+, extended, calm"],
      ["One person pets dog. Dog should be calm, sitting or lying down.", "Two people pet simultaneously — head and body. Dog should not get excited or overwhelmed.", "Three people around dog, all petting. Dog should be calm and tolerant.", "Crowd of people petting — clumsy, awkward, repetitive. Dog is calm.", "Group of 5+ people, extended petting session. Dog is relaxed throughout."],
    ),
    tip: "Therapy dogs get approached by groups. Dog must tolerate clumsy, awkward, repetitive petting without annoyance.",
  },
  {
    id: "T17",
    name: "Reading Program Calm",
    category: "Therapy Dog",
    track: "therapy-dog",
    minAgeWeeks: 24,
    prerequisites: ["T15"],
    description: "Dog lies still while a child reads aloud — for library and school reading programs.",
    levels: mkLevels(
      ["Lies down near child", "Stays while child reads 2 min", "Stays 10 min while child reads", "Multiple children, calm", "Full reading session, 20+ min"],
      ["Dog lies down near a child. Dog should be calm and relaxed.", "Child reads aloud for 2 minutes. Dog should stay lying down, not get up or wander.", "Child reads for 10 minutes. Dog should be relaxed, maybe sleeping.", "Multiple children around dog — reading, petting, showing pictures. Dog is calm.", "Full reading session, 20+ minutes. Dog is relaxed throughout. May rest head on child's lap."],
    ),
    tip: "Practice with a recording of a child reading. Kids read haltingly, sometimes loudly. Dog must be patient.",
  },
];

// ─── Service Dog Track (S1-S12) ───────────────────────────────────────────────

const SERVICE_DOG_SKILLS: Skill[] = [
  {
    id: "S1",
    name: "Public Access Manners",
    category: "Service Dog",
    track: "service-dog",
    minAgeWeeks: 24,
    prerequisites: ["F9", "F10"],
    description: "Dog is invisible in public — no sniffing, no begging, no pulling, no reactive behavior.",
    levels: mkLevels(
      ["Enters store, no pulling", "Doesn't sniff merchandise", "Ignores food on shelves", "Calm in crowded store", "Any public space, invisible"],
      ["Dog enters a store on loose leash. No pulling, no sniffing merchandise. Dog should be focused on handler.", "Dog walks past shelves without sniffing. Treat for keeping focus on handler.", "Dog walks past food on shelves without trying to eat or sniff. This is very hard for dogs.", "Calm in a crowded store — people, carts, noise. Dog stays at handler's side.", "Any public space — dog is invisible. No one notices the dog unless they look down. Service dog standard."],
    ),
    tip: "Service dogs must be invisible in public. This takes 18-24 months of consistent training.",
  },
  {
    id: "S2",
    name: "Under Table/Desk",
    category: "Service Dog",
    track: "service-dog",
    minAgeWeeks: 24,
    prerequisites: ["F10"],
    description: "Dog settles under table or desk for extended periods — restaurants, offices, classrooms.",
    levels: mkLevels(
      ["Goes under, 1 min", "Stays under 10 min", "Stays 30 min, quiet", "Stays through full meal", "Full workday, settles under desk"],
      ["Lure dog under table. Treat. Dog should stay for 1 minute. Release.", "Build to 10 minutes. Dog should be quiet, not pacing or whining.", "30 minutes under table. Dog should be settled, possibly sleeping.", "Full meal duration (45-60 min). Dog stays under table throughout.", "Full workday — dog settles under desk for hours. Gets up only when released or cued."],
    ),
    tip: "Dog should tuck paws and tail in, not stick out where people can trip. Practice in various settings.",
  },
  {
    id: "S3",
    name: "Elevator Calm",
    category: "Service Dog",
    track: "service-dog",
    minAgeWeeks: 24,
    prerequisites: ["F9"],
    description: "Dog enters, rides, and exits elevators calmly — no pacing, no anxiety.",
    levels: mkLevels(
      ["Enters, exits calmly", "Rides without pacing", "Crowded elevator, calm", "Sudden stop, calm", "Any elevator scenario"],
      ["Enter elevator with dog on leash. Dog should sit or stand calmly. Exit calmly. No rushing.", "Ride elevator up and down. Dog should not pace, whine, or show anxiety.", "Crowded elevator with several people. Dog should tuck close to handler, calm.", "Sudden stop or jerk. Dog should not panic. Treat for calm.", "Any elevator scenario — crowded, empty, fast, slow. Dog is calm and focused on handler."],
    ),
    tip: "Practice elevators in safe buildings first. Some dogs find the sensation unsettling — pair with treats.",
  },
  {
    id: "S4",
    name: "Stairs",
    category: "Service Dog",
    track: "service-dog",
    minAgeWeeks: 24,
    prerequisites: ["F9"],
    description: "Dog navigates stairs on leash in a controlled manner — up, down, with distractions.",
    levels: mkLevels(
      ["Up stairs on leash", "Down stairs on leash", "Stairs with distraction", "Holds position on stairs", "Any stair scenario, controlled"],
      ["Walk up stairs with dog on leash. Dog should go at your pace, not rush ahead.", "Walk down stairs. Dog should be controlled, not racing. Some dogs find down harder.", "Stairs with a distraction — person passing, noise. Dog should hold position.", "Dog holds position on stairs — can stop mid-staircase without anxiety.", "Any stair scenario — open, enclosed, spiral, crowded. Dog is controlled and calm."],
    ),
    tip: "Some dogs are afraid of open-back stairs (see-through steps). Practice on solid stairs first, then open.",
  },
  {
    id: "S5",
    name: "Restaurant Calm",
    category: "Service Dog",
    track: "service-dog",
    minAgeWeeks: 24,
    prerequisites: ["S2"],
    description: "Dog settles under table in restaurants for full meal duration — any setting.",
    levels: mkLevels(
      ["Sits under table 5 min", "15 min, quiet", "Full meal duration", "Busy restaurant", "Any dining setting, invisible"],
      ["Dog goes under table at a restaurant. Stays for 5 minutes. No sniffing food, no begging.", "15 minutes under table. Dog should be quiet and settled. Food smells everywhere — this is hard.", "Full meal duration (45-90 min). Dog stays under table throughout, no whining.", "Busy restaurant — noise, people walking by, food being served. Dog is calm.", "Any dining setting — food truck, fine dining, cafeteria. Dog is invisible under the table."],
    ),
    tip: "Dog should not eat dropped food. Practice 'leave it' extensively before attempting restaurants.",
  },
  {
    id: "S6",
    name: "Deep Pressure Therapy",
    category: "Service Dog",
    track: "service-dog",
    minAgeWeeks: 24,
    prerequisites: ["F10"],
    description: "Dog lies on/against handler for anxiety relief — deep pressure calms the nervous system.",
    levels: mkLevels(
      ["Approaches on cue, lies on", "Holds position 5 min", "Holds 20 min, through movement", "DPT in public", "Initiates when sensing anxiety"],
      ["Lure dog onto your chest or lap. Treat. Hold position 30 seconds. Release. Use cue 'press' or 'help.'", "On cue, dog climbs on and holds position. 5 minutes. Dog should be relaxed, not rigid.", "Dog holds position through your movement — shifting, breathing heavily. 20 minutes.", "Dog provides DPT in public — on a bench, at a desk, in a waiting room.", "Dog initiates DPT when sensing anxiety signals (pacing, shallow breathing, trembling). Works anywhere."],
    ),
    tip: "DPT works like a weighted blanket. Train position first, then duration, then context, then self-initiation.",
  },
  {
    id: "S7",
    name: "Grounding",
    category: "Service Dog",
    track: "service-dog",
    minAgeWeeks: 24,
    prerequisites: ["S6"],
    description: "Dog places paws on handler's lap/legs during dissociation or anxiety episodes.",
    levels: mkLevels(
      ["Responds to cue, places paws", "Responds to handler behavior pattern", "Positions correctly", "Holds through episode", "Initiates independently"],
      ["Cue dog to put front paws on your lap. Treat. Dog should hold for 30 seconds.", "Dog responds to handler's behavior pattern — pacing, fidgeting. Dog offers grounding position.", "Dog positions correctly — paws on lap, body weight providing gentle pressure.", "Dog holds grounding position through anxiety/dissociation episode. May lick handler's hand.", "Dog initiates grounding independently when sensing handler's distress. No cue needed."],
    ),
    tip: "Grounding is about the dog responding to the handler's emotional state, not just a cue. Build awareness gradually.",
  },
  {
    id: "S8",
    name: "Medication Reminder",
    category: "Service Dog",
    track: "service-dog",
    minAgeWeeks: 24,
    prerequisites: ["F1"],
    description: "Dog nudges handler at medication time — reliable alert at specific times.",
    levels: mkLevels(
      ["Responds to timer", "Responds to cue", "Reliable at specific time", "With distraction", "Any environment"],
      ["Set a timer. When it goes off, cue dog to nudge your hand. Treat. Dog learns: timer = nudge = treat.", "Dog nudges on cue 'remind.' Treat. Fade the timer, use the cue.", "Dog reliably nudges at the same time every day. Pair with alarm initially, then fade alarm.", "Dog nudges even with distractions — TV on, people talking, in public.", "Dog alerts reliably in any environment. Consistent, can't be ignored."],
    ),
    tip: "Medication reminders save lives. The alert must be persistent — dog should keep nudging until handler responds.",
  },
  {
    id: "S9",
    name: "Retrieval",
    category: "Service Dog",
    track: "service-dog",
    minAgeWeeks: 24,
    prerequisites: ["F8"],
    description: "Dog picks up and brings dropped or named items — keys, phone, medication, etc.",
    levels: mkLevels(
      ["Picks up toy", "Picks up named item", "Retrieves from floor", "Retrieves from another room", "Any item, any location"],
      ["Teach 'fetch' with a toy. Dog picks up toy, brings it, drops in hand. Treat.", "Name items — 'keys,' 'phone.' Dog picks up the correct item. Start with two items.", "Drop an item on the floor. Dog picks it up and brings it to your hand.", "Send dog to retrieve from another room. Dog should go, find item, bring it back.", "Any item, any location. Dog retrieves reliably. Can open doors/cabinets if needed."],
    ),
    tip: "Start with items dog likes to pick up. Metal keys and phones are harder — use fabric covers initially.",
  },
  {
    id: "S10",
    name: "Blocking",
    category: "Service Dog",
    track: "service-dog",
    minAgeWeeks: 24,
    prerequisites: ["F5"],
    description: "Dog stands behind handler to create space — for PTSD, anxiety, crowd management.",
    levels: mkLevels(
      ["Stands behind on cue", "Holds position", "Adjusts to crowd density", "In line/queue", "Any public setting"],
      ["Cue dog to stand behind you. Treat. Dog should be in contact with back of your legs.", "Dog holds position behind you as you stand. 1 minute. Dog should not wander.", "Dog adjusts position based on crowd density — closer in crowds, farther in open space.", "Dog blocks while you wait in line. People behind you can't get too close.", "Any public setting — dog automatically positions behind you when you stop. Invisible to others."],
    ),
    tip: "Blocking gives the handler a buffer zone. Dog should be calm, not reactive to people behind.",
  },
  {
    id: "S11",
    name: "Room Search",
    category: "Service Dog",
    track: "service-dog",
    minAgeWeeks: 24,
    prerequisites: ["F1", "F7"],
    description: "Dog clears room before handler enters — for PTSD, security, anxiety.",
    levels: mkLevels(
      ["Enters room on cue", "Checks corners", "Indicates clear", "With handler", "Identifies person"],
      ["Cue dog to enter room. Dog goes in, looks around. Treat. Dog should check the space.", "Dog systematically checks corners, behind doors, under bed. Treat for thorough search.", "Dog indicates 'clear' — sits at door or returns to handler. No one in room.", "Dog searches with handler at door. Dog enters, searches, returns, indicates clear.", "Advanced: dog identifies if a person is in the room and alerts handler."],
    ),
    tip: "Room search is about the dog's confidence and thoroughness. Dog should check all hiding spots.",
  },
  {
    id: "S12",
    name: "Sound Alert",
    category: "Service Dog",
    track: "service-dog",
    minAgeWeeks: 24,
    prerequisites: ["F1"],
    description: "Dog alerts handler to specific sounds — doorbell, alarm, phone, name called (for hearing impaired).",
    levels: mkLevels(
      ["Alerts to doorbell", "Alerts to phone", "Alerts to timer", "Alerts to handler's name", "Alerts to any designated sound"],
      ["Ring doorbell. Cue dog to nudge your leg. Treat. Dog learns: doorbell = nudge handler.", "Phone rings. Dog nudges handler. Treat. Dog should alert reliably to phone.", "Timer goes off. Dog alerts. Treat. Dog should alert within 3 seconds.", "Someone says handler's name. Dog alerts handler. This is advanced — requires training with many voices.", "Dog alerts to any designated sound — oven timer, smoke alarm, baby cry. Reliable, can't be ignored."],
    ),
    tip: "Alert should be persistent — dog should keep nudging until handler responds. Not a single bump and done.",
  },
];

// ─── Agility Track (A1-A10) ───────────────────────────────────────────────────

const AGILITY_SKILLS: Skill[] = [
  {
    id: "A1",
    name: "Jumps",
    category: "Agility",
    track: "agility",
    minAgeWeeks: 52,
    prerequisites: ["F9"],
    description: "Dog jumps over bars at correct height — foundation agility obstacle.",
    levels: mkLevels(
      ["Low bar (4 in), guided", "Correct height, 3 jumps", "Jump sequence", "Jump course", "Competition height, course"],
      ["Bar on ground. Dog steps over. Add low bar (4 inches). Guide with leash and treats. No jumping at full height until 12 months.", "Correct jump height (elbow height). Single jump, on cue ('over' or 'hop'). Send over and recall over.", "3-4 jumps in sequence. Set at correct height. Add a turn between jumps.", "Full jump course (5-8 jumps). Handler runs alongside. Distance handling (sending dog over while handler stays).", "Competition height. Full course. Speed and accuracy. Independent obstacle performance."],
    ),
    tip: "Jumping is fun but hard on joints. Keep sessions short (10-15 jumps max). Always cool down.",
  },
  {
    id: "A2",
    name: "Tunnels",
    category: "Agility",
    track: "agility",
    minAgeWeeks: 52,
    prerequisites: ["F9"],
    description: "Dog runs through tunnels — open, curved, and blind entry.",
    levels: mkLevels(
      ["Open tunnel, 3 ft", "10 ft tunnel", "Curved tunnel", "Tunnel in sequence", "Blind tunnel entry"],
      ["Start with short open tunnel (3 ft). Lure dog through. Treat on exit. Dog should run through confidently.", "Increase to 10 ft tunnel. Dog should run through without hesitation. Have someone hold dog at entrance, call from exit.", "Curved tunnel — dog can't see the exit. Build confidence gradually.", "Tunnel within a sequence of obstacles. Dog should enter tunnel on cue from a distance.", "Blind tunnel entry — dog enters from an angle where they can't see straight through. Advanced skill."],
    ),
    tip: "Some dogs are afraid of tunnels. Start very short and open. Never push dog in — let them choose to enter.",
  },
  {
    id: "A3",
    name: "Weave Poles",
    category: "Agility",
    track: "agility",
    minAgeWeeks: 56,
    prerequisites: ["F9"],
    description: "Dog weaves through 6-12 poles — the hardest agility skill to teach.",
    levels: mkLevels(
      ["2 poles, guided", "6 poles, channel method", "6 poles, closed", "12 poles", "12 poles, speed"],
      ["Start with 2 poles. Guide dog through with lure. Dog should enter between poles and weave.", "6 poles with channel method — poles offset (wider通道). Dog runs through center. Gradually close gap.", "6 poles fully closed. Dog should weave entry to exit. Uses 'weave' cue.", "12 poles. Dog weaves all 12 without hesitation. Entry should be correct (right shoulder next to pole 1).", "12 poles at speed. Dog weaves fast and independently. Handler can be at a distance."],
    ),
    tip: "Weave poles take the longest to train. Be patient. Channel method is most popular — gradually close the gap.",
  },
  {
    id: "A4",
    name: "A-Frame",
    category: "Agility",
    track: "agility",
    minAgeWeeks: 56,
    prerequisites: ["F9"],
    description: "Dog climbs over A-frame obstacle — contact obstacle with clear up and down.",
    levels: mkLevels(
      ["Low height, guided", "Full height, on cue", "Down side confidently", "In sequence", "Full speed"],
      ["Start at low height. Guide dog up and over with leash and treats. Dog should touch contact zone on descent.", "Full height A-frame. Dog goes over on cue. Should hit the contact zone (yellow) on the way down.", "Dog goes down confidently. No hesitation at the top. Hits contact zone reliably.", "A-frame within obstacle sequence. Dog performs independently.", "Full speed A-frame. Dog hits contact zone at speed. No hesitation. Competition-ready."],
    ),
    tip: "Contact zones are critical for competition. Train 'target' (touch nose to target) on the ground first.",
  },
  {
    id: "A5",
    name: "Dog Walk",
    category: "Agility",
    track: "agility",
    minAgeWeeks: 56,
    prerequisites: ["F9"],
    description: "Dog walks across elevated plank — up, across, down with confidence.",
    levels: mkLevels(
      ["Low plank on ground", "Raised plank", "Full dog walk", "In sequence", "Full speed, no hesitation"],
      ["Plank on ground. Dog walks across. Treat for confident crossing. No wobble.", "Raised plank (low height). Dog walks across. Should be confident, not rushing.", "Full dog walk — up ramp, across plank, down ramp. Dog should hit contact zones.", "Dog walk in sequence with other obstacles. Dog performs independently.", "Full speed dog walk. Dog is confident, hits contacts, no hesitation at height."],
    ),
    tip: "Some dogs rush the dog walk (fear of height). Teach slow, controlled walking first. Speed comes with confidence.",
  },
  {
    id: "A6",
    name: "See-Saw",
    category: "Agility",
    track: "agility",
    minAgeWeeks: 56,
    prerequisites: ["A5"],
    description: "Dog walks across see-saw that tilts under their weight — requires confidence and balance.",
    levels: mkLevels(
      ["Static plank (no movement)", "Slight movement", "Full see-saw", "In sequence", "Confident, no hesitation"],
      ["Plank that doesn't move. Dog walks across. Build confidence on the surface.", "Plank with slight movement — a pivot in the middle. Dog should stay on as it tips slightly.", "Full see-saw. Dog walks up, plank tips, dog rides it down. Should hit contact zone.", "See-saw in sequence. Dog performs independently. No hesitation at the tipping point.", "Dog is confident, doesn't pause at the tip. Rides it down smoothly. Competition-ready."],
    ),
    tip: "The tipping point is scary for some dogs. Reward heavily for staying on through the tip. Never push dog off.",
  },
  {
    id: "A7",
    name: "Pause Table",
    category: "Agility",
    track: "agility",
    minAgeWeeks: 52,
    prerequisites: ["F5"],
    description: "Dog jumps on table and holds a down position for a set time.",
    levels: mkLevels(
      ["Jump on, sit 3 sec", "Down, 5 sec", "Down, 5 sec, from distance", "In sequence", "Under judge timing"],
      ["Guide dog onto pause table. Treat for getting on. Ask for sit. Hold 3 seconds.", "Dog jumps on table, goes into down. Hold 5 seconds. Treat for staying.", "Send dog to table from a distance. Dog goes on, downs, holds 5 sec.", "Pause table in sequence. Dog jumps on, downs, holds, then continues on cue.", "Dog holds down for judge's count (5 sec in competition). No creeping, no early release."],
    ),
    tip: "Pause table requires impulse control in an exciting environment. Practice stays separately from agility.",
  },
  {
    id: "A8",
    name: "Directional Cues",
    category: "Agility",
    track: "agility",
    minAgeWeeks: 56,
    prerequisites: ["A1", "A2"],
    description: "Dog responds to handler's directional cues — front cross, rear cross, blind cross.",
    levels: mkLevels(
      ["Follows hand signal", "Front cross", "Rear cross", "Blind cross", "Course with multiple crosses"],
      ["Dog follows hand signal for direction. Left, right, forward. Treat for correct response.", "Front cross — handler changes side by turning in front of dog. Dog should follow handler's new position.", "Rear cross — handler crosses behind dog. Dog should turn in the new direction.", "Blind cross — handler turns away from dog (behind). Dog should trust and follow.", "Full course with multiple crosses. Dog and handler work as a team. Smooth transitions."],
    ),
    tip: "Directional cues are about handler-dog communication. Dog should be watching handler, not just running.",
  },
  {
    id: "A9",
    name: "Send to Obstacle",
    category: "Agility",
    track: "agility",
    minAgeWeeks: 56,
    prerequisites: ["A1", "A8"],
    description: "Dog is sent to an obstacle from a distance while handler stays behind.",
    levels: mkLevels(
      ["Send to jump, 5 ft", "Send to tunnel, 10 ft", "Send over 2 obstacles", "Send with handler at distance", "Independent obstacle performance"],
      ["Send dog to a jump from 5 ft away. Dog should go over without handler running alongside.", "Send dog to tunnel from 10 ft. Dog should enter tunnel independently.", "Send dog over 2 obstacles in sequence while handler stays behind.", "Send dog to obstacle with handler at 15+ ft distance. Dog performs independently.", "Dog performs obstacles independently. Handler directs from a distance. Advanced course handling."],
    ),
    tip: "Distance work requires the dog to be confident on each obstacle. Don't rush — build obstacle skills first.",
  },
  {
    id: "A10",
    name: "Sequence Running",
    category: "Agility",
    track: "agility",
    minAgeWeeks: 56,
    prerequisites: ["A8", "A9"],
    description: "Dog and handler run full agility courses together — smooth, fast, accurate.",
    levels: mkLevels(
      ["3-obstacle sequence", "5-obstacle sequence", "Full course (10+ obstacles)", "Course with crosses", "Competition course, clean run"],
      ["Run a 3-obstacle sequence. Dog should flow from one to the next on handler's cues.", "5-obstacle sequence with a cross. Smooth transitions, no confusion.", "Full course (10+ obstacles). Dog and handler run together. Accurate and flowing.", "Full course with front, rear, and blind crosses. Handler is proactive, not reactive.", "Competition-level course. Clean run, no faults, fast time. Dog and handler are a team."],
    ),
    tip: "Course running is about partnership. Dog should be watching handler for cues, not just memorizing the course.",
  },
];

// ─── ESA Track (E1-E5) ────────────────────────────────────────────────────────

const ESA_SKILLS: Skill[] = [
  {
    id: "E1",
    name: "Bond Building",
    category: "ESA",
    track: "esa",
    minAgeWeeks: 8,
    prerequisites: [],
    description: "Trust exercises, shared activities, and routine to build a deep handler-dog bond.",
    levels: mkLevels(
      ["Short sessions (5 min)", "Daily routines (15 min)", "Deep trust, dog checks in", "Dog seeks you when stressed", "Unshakeable bond, deep trust"],
      ["Hand-feeding, shared play, grooming sessions. 5-minute bonding sessions several times daily.", "Daily routines — walks together, training, calm time. 15 minutes of dedicated bonding.", "Dog offers check-ins unprompted. Comes to you when unsure. Bond is visible.", "Dog seeks you out when stressed or frightened. You are their safe person.", "Unshakeable bond. Dog is deeply attached and trusts you completely. Ideal ESA relationship."],
    ),
    tip: "Don't push the dog away when you're upset — let them comfort you. This is their job.",
  },
  {
    id: "E2",
    name: "Calm Settle During Distress",
    category: "ESA",
    track: "esa",
    minAgeWeeks: 8,
    prerequisites: ["F10"],
    description: "Dog stays near handler and remains calm during emotional distress episodes.",
    levels: mkLevels(
      ["Stays near you 1 min", "5 min, dog offers contact", "15 min, physical contact", "30 min, settles on/near you", "60 min, calm throughout"],
      ["Dog stays near you 1 minute while you're upset. Dog should not leave the room.", "5 minutes. Dog offers physical contact — leans, puts head on lap.", "15 minutes. Dog provides physical contact throughout. Calm, not anxious.", "30 minutes. Dog settles on or near you. Remains calm throughout your distress.", "60 minutes. Dog is calm and present throughout. Provides comfort without anxiety."],
    ),
    tip: "Practice by simulating distress (sighing, sitting on floor) and rewarding dog for approaching.",
  },
  {
    id: "E3",
    name: "Pressure Therapy",
    category: "ESA",
    track: "esa",
    minAgeWeeks: 16,
    prerequisites: ["E1"],
    description: "Dog provides physical comfort — lap sit, lean, or lying on handler — without public access requirement.",
    levels: mkLevels(
      ["On cue, lies on/near", "During distress, offers contact", "Extended pressure, 15 min", "In public (cafe, park)", "Initiates independently"],
      ["Cue dog to lie on or against you. Treat. Dog should provide gentle weight and warmth.", "During emotional distress, dog offers physical contact without being cued.", "Extended pressure therapy — 15 minutes. Dog should be relaxed, not restless.", "Dog provides pressure therapy in public — on a bench at a park, at a cafe.", "Dog initiates pressure therapy when sensing handler's distress. No cue needed."],
    ),
    tip: "Same as Service Dog DPT but without the public access requirement. Dog provides comfort at home.",
  },
  {
    id: "E4",
    name: "Travel Calm",
    category: "ESA",
    track: "esa",
    minAgeWeeks: 12,
    prerequisites: ["SOC3"],
    description: "Dog is calm in car, at vet, and in new environments.",
    levels: mkLevels(
      ["Calm in car, 5 min ride", "Calm at vet lobby", "Calm in public space", "Calm in crowded area", "Calm in any environment"],
      ["Dog rides in car calmly for 5 minutes. No pacing, whining, or sickness. Pair with treats.", "Dog is calm in vet lobby. No shaking, whining, or attempts to leave. Treat for calm.", "Dog is calm in a public space — pet store, outdoor cafe. Relaxed body language.", "Dog is calm in a crowded area. Should not be overwhelmed or anxious.", "Dog is calm in any environment. Travels well, adapts quickly to new places."],
    ),
    tip: "Some dogs get car sick. Start with very short rides and build up. Don't feed right before car trips.",
  },
  {
    id: "E5",
    name: "Basic Manners (ESA)",
    category: "ESA",
    track: "esa",
    minAgeWeeks: 8,
    prerequisites: [],
    description: "Sit, come, leave it, no jumping — ESA doesn't need specialized training but good manners make a better ESA.",
    levels: mkLevels(
      ["Sit + name recognition", "Sit + come + leave it (L1)", "All Foundation L2 skills", "Solid Foundation skills (L3)", "Reliable manners anywhere"],
      ["Dog responds to name and can sit on cue. Foundation skills F1, F3 at L1.", "Dog has sit, come, and leave it at L1-L2. Basic manners are developing.", "All Foundation skills (F1-F10) at L2. Dog has basic obedience.", "Foundation skills at L3 (Solid). Dog is reliable in low-distraction environments.", "Reliable manners anywhere. Dog is a well-behaved ESA that's welcome everywhere ESAs are allowed."],
    ),
    tip: "ESA doesn't need specialized training but good manners make a better ESA. Track via Foundation skills.",
  },
];

// ─── Tricks Track (TR1-TR14) ──────────────────────────────────────────────────

const TRICKS_SKILLS: Skill[] = [
  {
    id: "TR1",
    name: "Shake / Paw",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 10,
    prerequisites: ["F3"],
    description: "Dog offers paw to shake hands — classic trick and crowd pleaser.",
    levels: mkLevels(
      ["Reaches for treat in fist", "Holds paw 2 sec", "Paw on cue, no lure", "Alternates paws", "Shake with stranger"],
      ["Hold treat in closed fist. Dog paws at it. Open fist and treat. Add 'shake' as they lift paw.", "Present open hand. Dog places paw in it. Treat from other hand. Add verbal 'shake.'", "Verbal only, no hand presented. Dog offers paw on 'shake' cue.", "Shake with alternate paw ('other one'). Hold usual paw, ask for shake — they'll use other one.", "Shake on cue in performance setting. Combo: shake then high five."],
    ),
    tip: "Some dogs offer the same paw every time. To teach 'other paw,' gently hold the usual paw and ask for shake.",
  },
  {
    id: "TR2",
    name: "Spin",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 10,
    prerequisites: [],
    description: "Dog spins in a circle on cue — fun and easy trick.",
    levels: mkLevels(
      ["Follows lure in circle", "Spins on verbal cue", "Spins both directions", "Spin with distraction", "Spin in performance"],
      ["Lure dog in a circle with treat. Dog follows. Mark and treat when they complete the circle.", "Fade lure — use finger motion, then verbal 'spin.' Dog should spin on verbal cue.", "Teach both directions — 'spin' (clockwise) and 'twist' (counter-clockwise). Use different cues.", "Dog spins with distractions present. Should respond to verbal cue only.", "Spin in performance setting. Smooth, fast, on cue. Can spin multiple times."],
    ),
    tip: "Use different cues for each direction. 'Spin' for clockwise, 'twist' for counter-clockwise.",
  },
  {
    id: "TR3",
    name: "Roll Over",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 12,
    prerequisites: ["F4"],
    description: "Dog rolls from down onto their back and over to the other side.",
    levels: mkLevels(
      ["Lured onto side", "Rolls with lure", "Rolls on verbal cue", "Rolls both directions", "Roll on cue, any surface"],
      ["From a down, lure treat from nose toward shoulder. Dog rolls onto side. Mark and treat.", "Continue lure from shoulder toward the floor behind them. Dog rolls over. Mark and jackpot.", "Fade lure — use hand motion, then verbal 'roll over.' Dog should roll on verbal cue.", "Teach both directions. 'Roll over' for one way, 'roll' for the other.", "Dog rolls over on any surface — grass, carpet, concrete. On verbal cue only."],
    ),
    tip: "Some dogs resist rolling on certain surfaces. Start on soft carpet or grass. Use high-value treats.",
  },
  {
    id: "TR4",
    name: "Play Dead",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 14,
    prerequisites: ["F4", "TR3"],
    description: "Dog falls onto side and plays dead on cue — dramatic crowd pleaser.",
    levels: mkLevels(
      ["Down on side", "Holds position 3 sec", "'Bang' cue, holds 10 sec", "With distraction", "Dramatic, holds until released"],
      ["From a down, lure dog onto side. Mark and treat. Dog should be on side, not rolling over.", "Dog holds side position for 3 seconds. Add 'bang' cue with finger gun gesture.", "Dog plays dead on 'bang' cue. Holds for 10 seconds. Release with 'okay.'", "Dog plays dead with distractions — people watching, other dogs nearby.", "Dramatic performance — dog falls to side on 'bang,' holds until released. Crowd favorite."],
    ),
    tip: "Use a distinct cue like 'bang' with finger gun. Dog should fall dramatically, not just lie down.",
  },
  {
    id: "TR5",
    name: "Bow",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 10,
    prerequisites: [],
    description: "Dog lowers front end while keeping rear up — a curtsy bow.",
    levels: mkLevels(
      ["Lured into bow", "Bow on cue", "Bow on verbal only", "Bow as greeting", "Bow in sequence"],
      ["From a stand, lure treat from nose down between front paws. Dog's elbows hit floor, rear stays up. Mark and treat.", "Fade lure — use hand motion, then verbal 'bow.' Dog should bow on cue.", "Dog bows on verbal cue only. No hand signal needed.", "Dog offers bow as a greeting — when meeting people, when you come home.", "Bow in a sequence with other tricks. Bow then spin then jump. Performance ready."],
    ),
    tip: "Bow is a natural stretching behavior. Capture it when dog does it naturally — mark and treat.",
  },
  {
    id: "TR6",
    name: "Crawl",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 14,
    prerequisites: ["F4"],
    description: "Dog crawls on belly toward a target — commando-style crawl.",
    levels: mkLevels(
      ["Down, moves toward treat 1 ft", "Crawls 3 ft", "Crawls on cue", "Crawls under obstacle", "Crawl 10+ ft"],
      ["From a down, place treat 1 ft ahead. Dog should belly-crawl toward it. Mark and treat.", "Increase distance to 3 ft. Dog should crawl without standing up. Use treat lure.", "Add verbal 'crawl.' Fade lure. Dog should crawl on verbal cue.", "Dog crawls under a low obstacle (chair, broom handle). Should not stand up.", "Dog crawls 10+ ft on cue. Can crawl under multiple obstacles. Impressive trick."],
    ),
    tip: "If dog stands up to get the treat, start over. Dog should keep belly on the ground throughout.",
  },
  {
    id: "TR7",
    name: "Peekaboo (Cover Eyes)",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 16,
    prerequisites: ["TR1"],
    description: "Dog covers their eyes with paw on cue — adorable peekaboo trick.",
    levels: mkLevels(
      ["Touches face with paw", "Holds paw on face 2 sec", "On verbal cue", "Holds 5 sec", "Dramatic, on cue"],
      ["Put small piece of tape or sticky note on dog's nose. Dog paws at it. Mark and treat.", "Dog holds paw on face for 2 seconds. Add 'peekaboo' cue. Treat for holding.", "On verbal 'peekaboo,' dog covers eyes with paw. No tape needed. Treat from other hand.", "Dog holds position for 5 seconds. Release with 'okay.'", "Dramatic performance — dog covers eyes on cue, holds, then looks up on release."],
    ),
    tip: "The sticky note trick is the easiest way to start. Fade the note by making it smaller each session.",
  },
  {
    id: "TR8",
    name: "Weave Through Legs",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 56,
    prerequisites: ["F9"],
    description: "Dog weaves between handler's legs while walking — flashy trick.",
    levels: mkLevels(
      ["One weave, lured", "3 weaves", "Full figure-8", "With movement", "Weave while walking"],
      ["Stand with legs apart. Lure dog through one leg. Treat. Dog should go between legs.", "Three weaves — left, right, left. Lure dog through in figure-8 pattern.", "Full figure-8 between your legs. Dog should weave without hesitation.", "Handler walks slowly, dog weaves through legs in motion. Advanced coordination.", "Handler walks normally, dog weaves between legs continuously. Performance ready."],
    ),
    tip: "Start with handler standing still. Build the weaving pattern before adding movement.",
  },
  {
    id: "TR9",
    name: "Fetch / Retrieve",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 12,
    prerequisites: ["F8"],
    description: "Dog brings items back to handler — from basic fetch to retrieving named items.",
    levels: mkLevels(
      ["Chases toy", "Picks up toy", "Brings toy back", "Drops in hand", "Retrieves named items"],
      ["Throw toy. Dog chases it. Treat for chasing. Some dogs do this naturally.", "Dog picks up toy in mouth. Mark. Treat for picking up.", "Dog brings toy back toward you. Call dog while they have toy. Treat when they return.", "Dog drops toy in your hand on cue ('drop it'). Full fetch cycle.", "Dog retrieves named items — 'keys,' 'phone,' 'leash.' Advanced and useful."],
    ),
    tip: "Some breeds fetch naturally (retrievers). Others need more work. Break it into chase, pick up, return, drop.",
  },
  {
    id: "TR10",
    name: "Speak / Whisper",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 16,
    prerequisites: [],
    description: "Dog barks or whispers (soft bark) on cue — vocalization trick.",
    levels: mkLevels(
      ["Barks on cue", "Quiet bark on cue", "Whisper (soft bark)", "Speak then quiet", "Bark on signal only"],
      ["Get dog excited with a toy. When they bark, mark 'speak' and treat. Pair cue with barking.", "Dog barks on 'speak' cue. Treat for one bark only — don't reward excessive barking.", "Teach 'whisper' — soft, quiet bark. Reward only quiet barks on 'whisper' cue.", "Dog speaks on cue, then goes quiet on 'quiet' cue. Both on verbal commands.", "Dog barks on hand signal only. Can do speak and whisper on different cues."],
    ),
    tip: "Only reward ONE bark. If dog barks 5 times, you've taught excessive barking. Mark the first bark only.",
  },
  {
    id: "TR11",
    name: "High Five",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 10,
    prerequisites: ["TR1"],
    description: "Dog slaps handler's raised hand with paw — variation of shake.",
    levels: mkLevels(
      ["Slaps hand", "On verbal cue", "With stranger", "Alternates paws", "Combo: shake then high five"],
      ["Present hand raised high. Dog reaches up and slaps it. Mark and treat.", "Add verbal 'high five.' Dog should high five on verbal cue.", "Dog high fives with a stranger. Should be gentle — don't scratch people.", "Dog alternates paws — 'high five' and 'other one.' Both paws.", "Combo: shake then high five then wave. Performance sequence."],
    ),
    tip: "High five is shake but with hand raised. Dog should reach up, not just lift paw to side.",
  },
  {
    id: "TR12",
    name: "Back Up",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 14,
    prerequisites: ["F3"],
    description: "Dog walks backwards on cue — useful and impressive.",
    levels: mkLevels(
      ["Steps back 1 step", "3 steps back", "Backs up on cue", "Backs up 10 ft", "Backs into narrow space"],
      ["Face dog. Walk toward them. Dog steps back. Mark 'back up' and treat.", "Dog takes 3 steps back on cue. Use hand signal (pushing motion) and verbal.", "Dog backs up on verbal cue only. No handler movement needed.", "Dog backs up 10 ft in a straight line. Should not turn around.", "Dog backs into a narrow space — between your legs, into a doorway. Precision backing."],
    ),
    tip: "Back up is useful for agility, service dog work, and everyday life. Dog should back straight, not curving.",
  },
  {
    id: "TR13",
    name: "Tidy Up (Put Toys Away)",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 24,
    prerequisites: ["TR9", "F8"],
    description: "Dog picks up toys and puts them in a box — viral video material.",
    levels: mkLevels(
      ["Takes toy to box area", "Drops toy in box", "On cue, 1 toy", "3 toys in box", "Tidies all toys"],
      ["Place toy box on floor. Give dog a toy near the box. When dog drops toy near box area, mark and treat.", "Position toy directly over box. Dog drops it in. Celebrate. Repeat with different toys.", "Say 'tidy up' or 'put it away.' Send dog to get a toy and bring it to the box. Treat for each deposit.", "Dog picks up 3 toys one by one and puts each in the box.", "Dog tidies all toys on the floor into the box on cue. Viral video material."],
    ),
    tip: "Start with a large, shallow box (hard to miss). Gradually use a smaller/deeper box. Film it!",
  },
  {
    id: "TR14",
    name: "Say Your Prayers",
    category: "Tricks",
    track: "tricks",
    minAgeWeeks: 24,
    prerequisites: ["F4"],
    description: "Dog puts paws on armrest and tucks head between paws — praying pose.",
    levels: mkLevels(
      ["Paws on armrest", "Tucks head", "Holds 5 sec", "On verbal cue", "Extended, dramatic"],
      ["Lure dog to put front paws on a chair armrest or low table. Mark and treat.", "Once paws are up, lure head down between paws. Dog should tuck nose toward chest. Mark and treat.", "Dog holds the praying pose for 5 seconds. Release with 'amen.'", "On verbal 'pray,' dog puts paws up and tucks head. No lure needed.", "Extended, dramatic pose. Dog holds for 10+ seconds. Release with 'amen.' Crowd favorite."],
    ),
    tip: "Use a release word like 'amen' for this trick — adds to the performance. Dog should hold until released.",
  },
];

// ─── All Skills Combined ──────────────────────────────────────────────────────

export const ALL_SKILLS: Skill[] = [
  ...FOUNDATION_SKILLS,
  ...FAMILY_PET_SKILLS,
  ...SOCIALIZATION_SKILLS,
  ...THERAPY_DOG_SKILLS,
  ...SERVICE_DOG_SKILLS,
  ...AGILITY_SKILLS,
  ...ESA_SKILLS,
  ...TRICKS_SKILLS,
];

export const SKILLS_BY_ID: Record<string, Skill> = Object.fromEntries(
  ALL_SKILLS.map((s) => [s.id, s]),
);

export const SKILLS_BY_TRACK: Record<TrackId, Skill[]> = {
  "foundation": FOUNDATION_SKILLS,
  "family-pet": FAMILY_PET_SKILLS,
  "socialization": SOCIALIZATION_SKILLS,
  "therapy-dog": THERAPY_DOG_SKILLS,
  "service-dog": SERVICE_DOG_SKILLS,
  "agility": AGILITY_SKILLS,
  "esa": ESA_SKILLS,
  "tricks": TRICKS_SKILLS,
};

export const TRACK_INFO: Record<TrackId, { name: string; emoji: string; description: string; minAgeWeeks: number }> = {
  "foundation": { name: "Foundation", emoji: "🌿", description: "Every dog starts here. Basic obedience, manners, bonding.", minAgeWeeks: 8 },
  "family-pet": { name: "Family Pet", emoji: "🏠", description: "Good household manners, polite greetings, settling in public.", minAgeWeeks: 8 },
  "socialization": { name: "Socialization", emoji: "🌍", description: "Exposure to people, places, sounds, surfaces, handling.", minAgeWeeks: 8 },
  "therapy-dog": { name: "Therapy Dog", emoji: "❤️", description: "CGC + therapy-specific skills for hospital/school visits.", minAgeWeeks: 24 },
  "service-dog": { name: "Service Dog", emoji: "🐕‍🦺", description: "Public access + disability-specific task training.", minAgeWeeks: 24 },
  "agility": { name: "Agility", emoji: "🏃", description: "Obstacle course performance, handler communication, fitness.", minAgeWeeks: 52 },
  "esa": { name: "ESA", emoji: "🫂", description: "Emotional support companion — bonding + basic manners.", minAgeWeeks: 8 },
  "tricks": { name: "Tricks", emoji: "🎭", description: "Fun tricks for mental stimulation and bonding.", minAgeWeeks: 10 },
};

// ─── Session Prompt Logic ─────────────────────────────────────────────────────

export interface SkillSuggestion {
  skill: Skill;
  reason: string;
}

/**
 * Suggest 2-3 skills based on: selected track(s), skills not yet at L3,
 * skills not practiced recently, age-appropriate skills.
 */
export function suggestSkills(
  tracks: TrackId[],
  ageWeeks: number,
  skillProgress: Map<string, number>, // skillId -> currentLevel
  lastPracticed: Map<string, string>, // skillId -> ISO date
): SkillSuggestion[] {
  const suggestions: SkillSuggestion[] = [];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get all skills from selected tracks, filtered by age
  const eligible = ALL_SKILLS.filter((skill) => {
    if (!tracks.includes(skill.track)) return false;
    if (skill.minAgeWeeks > ageWeeks) return false;
    // Skip skills that are already mastered (L5)
    const level = skillProgress.get(skill.id) ?? 0;
    if (level >= 5) return false;
    return true;
  });

  // Sort by: not practiced recently, not at L3 yet, prerequisites met
  const scored = eligible.map((skill) => {
    let score = 0;
    const level = skillProgress.get(skill.id) ?? 0;
    const lastPrac = lastPracticed.get(skill.id);

    // Prefer skills below L3 (still building foundation)
    if (level < 3) score += 10;
    else if (level < 5) score += 5;

    // Prefer skills not practiced in the last week
    if (!lastPrac) score += 8; // never practiced
    else if (new Date(lastPrac) < weekAgo) score += 5;

    // Prefer skills with prerequisites met
    const prereqsMet = skill.prerequisites.every((p) => (skillProgress.get(p) ?? 0) >= 2);
    if (prereqsMet) score += 3;
    else score -= 5; // penalize if prereqs not met

    // Prefer foundation skills
    if (skill.track === "foundation") score += 2;

    return { skill, score, level, lastPrac };
  });

  scored.sort((a, b) => b.score - a.score);

  // Take top 3, but ensure variety (different skills)
  const top = scored.slice(0, 3);

  for (const item of top) {
    const reasons: string[] = [];
    if (item.level === 0) reasons.push("New skill to introduce");
    else if (item.level < 3) reasons.push(`Building toward L${item.level + 1}`);
    else reasons.push(`Advancing from L${item.level}`);

    if (!item.lastPrac) reasons.push("not practiced yet");
    else {
      const days = Math.floor((now.getTime() - new Date(item.lastPrac).getTime()) / (1000 * 60 * 60 * 24));
      if (days > 7) reasons.push(`${days} days since last practice`);
    }

    suggestions.push({
      skill: item.skill,
      reason: reasons.join(", "),
    });
  }

  // If we don't have enough suggestions, add foundation skills
  if (suggestions.length < 2) {
    for (const skill of FOUNDATION_SKILLS) {
      if (suggestions.find((s) => s.skill.id === skill.id)) continue;
      if (skill.minAgeWeeks > ageWeeks) continue;
      const level = skillProgress.get(skill.id) ?? 0;
      if (level >= 5) continue;
      suggestions.push({
        skill,
        reason: level === 0 ? "New skill to introduce" : `Building toward L${level + 1}`,
      });
      if (suggestions.length >= 3) break;
    }
  }

  return suggestions.slice(0, 3);
}

/**
 * Map training goals from onboarding to track IDs.
 */
export function goalsToTracks(goals: string[]): TrackId[] {
  const map: Record<string, TrackId> = {
    "Basic Obedience": "foundation",
    "Family Pet": "family-pet",
    "Therapy Dog": "therapy-dog",
    "Service Dog": "service-dog",
    "Agility": "agility",
    "ESA": "esa",
    "Tricks": "tricks",
  };
  const tracks: TrackId[] = ["foundation"]; // always include foundation
  for (const goal of goals) {
    const track = map[goal];
    if (track && !tracks.includes(track)) tracks.push(track);
  }
  // Always include socialization for puppies
  if (!tracks.includes("socialization")) tracks.push("socialization");
  return tracks;
}
