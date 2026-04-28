ALTER TABLE products ADD COLUMN IF NOT EXISTS description text;

UPDATE products SET description = 'You keep ending up in the same situations with different people and different contexts. Same outcome, different packaging. The Life Spread lays out your 13 core cards and shows you exactly which patterns are running the show, where they come from, and why they keep showing up no matter what you change on the surface.' WHERE slug = 'babe-life-spread';

UPDATE products SET description = 'You can read a room, hold space for everyone, and still have no idea why certain people drain you or why the same relational dynamic keeps repeating. The Mirror reads how you are wired to show up with others, what you project, what you attract, and what your data says about why your relationships follow the same script.' WHERE slug = 'babe-mirror';

UPDATE products SET description = 'You have a specific thing you keep bumping into. A pattern around money, visibility, decision-making, or something else you cannot quite name. The Lens goes deep into one system to give you a clear, focused read on exactly that thread and nothing else.' WHERE slug = 'babe-lens';

UPDATE products SET description = 'Two things in your life that should work together keep creating friction instead. The Crossing identifies where two active patterns in your data are meeting and what that collision is actually producing, so you can stop trying to fix the symptom and see the structure underneath.' WHERE slug = 'babe-crossing';

UPDATE products SET description = 'You already know something is a pattern. You have named it, journalled it, talked about it. What you do not have is a clear read on why it is still running. The Reckoning pulls up the data, names the pattern directly, and shows you what has been keeping it in place.' WHERE slug = 'babe-reckoning';

UPDATE products SET description = 'Something ended. A relationship, a business, a version of yourself. You are not lost but you are not sure what is actually yours to build next versus what you are carrying out of habit. The Rebuild reads what your data says is available now, what is closing, and what the next chapter is structurally asking of you.' WHERE slug = 'babe-rebuild';

UPDATE products SET description = 'You are trying to make decisions but you cannot tell what is timing and what is fear. The BABE 90 maps the next three months of your pattern window, showing you what is active, what is building, and what to stop pushing against so you can move with your data instead of against it.' WHERE slug = 'babe-90';

UPDATE products SET description = 'You have done the personality tests. You have the vocabulary. What you do not have is a read that actually crosses all of it, verifies what repeats, and gives you one clear picture of how you are wired. The BABE Signature runs your data through all eight systems, cross-references every pattern, and only reports what three or more lenses confirm. No generalising. No guessing. Just what is actually there.' WHERE slug = 'babe-signature';

UPDATE products SET description = 'You know how to work. What you cannot see is whether you are working in alignment with how you are actually wired to lead, decide, and build. The Business Lens reads one system in your data through a business lens and shows you the specific pattern that is shaping how you operate, so you can stop overriding your own wiring.' WHERE slug = 'babe-business-lens';

UPDATE products SET description = 'You have built something but the way you are showing up publicly feels off, exhausting, or like it belongs to someone else. The Brand Frequency reads what your data says about how you naturally communicate, what kind of presence you actually carry, and what frequency your brand needs to run on to feel like yours.' WHERE slug = 'babe-brand-frequency';

UPDATE products SET description = 'You are building but you keep hitting the same walls. Burn out looks the same every time. Decisions take longer than they should. You cannot tell if it is the business or you. The Founder Read maps your pattern as a builder, shows you where you are wired to lead and where you are working against your own grain, and gives you a clear picture of what sustainable looks like in your data.' WHERE slug = 'babe-founder-read';

UPDATE products SET description = 'Your business decisions are shaped by patterns you have never had a name for. The Business Signature is the complete read of how you are wired, applied entirely to how you build and lead. Every lens, business context, cross-referenced and verified. The full picture of you as a founder.' WHERE slug = 'babe-business-signature';

UPDATE products SET description = 'The dynamic between you and your daughter has a pattern and you can both feel it even if neither of you can name it. The Bond reads the data on both sides, shows you exactly where the connection points are, where the friction is structurally coming from, and what the pattern says about how to move within this relationship without either of you losing themselves.' WHERE slug = 'babe-bond-mother-daughter';

UPDATE products SET description = 'Co-parenting is one of the hardest relational dynamics there is because you did not choose to stay connected but you have to be. The Co-Parenting Bond reads how you and your co-parent are wired to clash and where the pattern says there is room to move. Not therapy. Not advice. Just the data on what is actually happening between you.' WHERE slug = 'babe-bond-co-parenting';

UPDATE products SET description = 'There is one relationship in your life that you cannot figure out. You have tried every angle and you still end up in the same place with this person. The Bond Lens reads the connection data between you and one other person and shows you what is structurally happening in the dynamic, so you can stop guessing and start seeing it clearly.' WHERE slug = 'babe-bond-lens';

UPDATE products SET description = 'This is the complete two-person read. Every connection point between you and another person, every tension point, every place where your patterns meet and what that produces. Cross-referenced across all systems. Nothing missed. For the relationship you need to understand fully.' WHERE slug = 'babe-bond-signature';

UPDATE products SET description = 'You know your pattern exists but you cannot see it moving in real time. Daily Frequency delivers your personalised card and pattern note every morning, Monday to Friday, based on your actual birthprint. Not a generic horoscope. Your data, your pattern, your day. Friday includes your weekend read. Cancel anytime.' WHERE slug = 'daily-frequency-personal';

UPDATE products SET description = 'You are making decisions but you cannot tell if the timing is right or if you are forcing something that is not ready. The BABE Pulse maps the next three months of your personal pattern window, showing you what is active, what is building quietly, and what to stop pushing so you can move with your data instead of against it.' WHERE slug = 'babe-pulse';

UPDATE products SET description = 'You have a quarter ahead of you and you need to know what your data says about it. The Business Pulse maps the next three months through a work lens, showing you what is energetically available for building, what needs to slow down, and where your pattern says the timing is in your favour.' WHERE slug = 'babe-business-pulse';

UPDATE products SET description = 'Something is shifting in a specific relationship and you can feel it but you cannot read it. The Bond Pulse maps the next three months of the pattern between you and one other person, showing you what is moving, what is closing, and what the timing says about how to navigate it.' WHERE slug = 'babe-bond-pulse';

UPDATE products SET description = 'You are moving through a year that feels significant but you cannot see the shape of it. The Year Map covers your full birthday-to-birthday year, maps each period, and shows you what each window is activating, what the year as a whole is asking of you, and where your data says the natural pivot points are.' WHERE slug = 'your-babe-year-map';

UPDATE products SET description = 'You are planning a year in your business without knowing what your pattern says is actually available. The Business Year Map covers your full birthday-to-birthday work year, showing you the timing of each period, what to build in each window, and where your pattern says to move and where to hold.' WHERE slug = 'your-babe-business-year';

UPDATE products SET description = 'A relationship in your life is going through something and you want to understand the timing of it. The Bond Year maps a full year of the pattern between two people, showing how the dynamic shifts across each period and what the data says about the shape of the year between you.' WHERE slug = 'your-babe-bond-year';

UPDATE products SET description = 'You understand your pattern conceptually but you have never had a structured way to live it. The Journey delivers 52 weeks of pattern-informed prompts, chakra themes, and integration practices directly to your portal. Each week builds on the last. You do not just read your pattern. You learn to live it. Cancel anytime.' WHERE slug = 'babe-52-week-journey-monthly';

UPDATE products SET description = 'See which card is active today and get a short pattern note for the collective energy. No birth data needed. A daily taste of what the system tracks.' WHERE slug = 'daily-frequency-free';

UPDATE products SET description = 'You have a birthdate. You have never seen what it actually maps to across five systems. Enter your details and get a free multi-lens preview of your pattern. A real look at what a full read shows you.' WHERE slug = 'birthprint-snapshot';

UPDATE products SET description = 'You are in a personal year cycle right now and it is shaping everything from your energy to your decisions. Enter your birthday and find out which year you are in, what it is asking of you, and what to stop fighting.' WHERE slug = 'your-babe-year-free';
