-- Seed data for 25 classic viral YouTube videos
-- Note: These use embedded YouTube videos - no video hosting required

INSERT INTO lessons (title, description, video_url, thumbnail_url, difficulty, vocab_pairs, gap_fill_sentences, published, created_by)
VALUES 
-- 1. Dramatic Chipmunk
(
  'Dramatic Chipmunk',
  'A prairie dog dramatically turns to face the camera with intense music',
  'https://www.youtube.com/watch?v=mfhBM_Yay6w',
  'https://img.youtube.com/vi/mfhBM_Yay6w/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "dramatic", "definition": "showing sudden strong emotion or excitement"},
    {"term": "whip around", "definition": "to turn very quickly"},
    {"term": "glare", "definition": "to look at someone with anger"},
    {"term": "prairie dog", "definition": "a small animal that lives in holes in the ground"},
    {"term": "intense", "definition": "very strong or extreme"}
  ]'::jsonb,
  '[
    {"text": "The prairie dog [BLANK] around dramatically.", "blanks": ["whips"]},
    {"text": "The music makes the moment feel very [BLANK].", "blanks": ["intense"]},
    {"text": "The animal seems to [BLANK] at the camera.", "blanks": ["glare"]}
  ]'::jsonb,
  true,
  null
),

-- 2. It's Wednesday My Dudes
(
  'It''s Wednesday My Dudes',
  'A man in a Spider-Man costume announces Wednesday and screams',
  'https://www.youtube.com/watch?v=du-TY1GUFGk',
  'https://img.youtube.com/vi/du-TY1GUFGk/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "announce", "definition": "to say something officially or publicly"},
    {"term": "costume", "definition": "special clothes worn to look like someone else"},
    {"term": "scream", "definition": "to make a loud, high sound"},
    {"term": "dude", "definition": "informal word for a person (usually male)"},
    {"term": "meme", "definition": "a funny image or video shared on the internet"}
  ]'::jsonb,
  '[
    {"text": "He is wearing a Spider-Man [BLANK].", "blanks": ["costume"]},
    {"text": "The man [BLANK] that it is Wednesday.", "blanks": ["announces"]},
    {"text": "At the end, he lets out a loud [BLANK].", "blanks": ["scream"]}
  ]'::jsonb,
  true,
  null
),

-- 3. Surprised Pikachu
(
  'Surprised Pikachu',
  'Pikachu shows a shocked expression when Butterfree evolves',
  'https://www.youtube.com/shorts/Icbk_6iIL0o',
  'https://img.youtube.com/vi/Icbk_6iIL0o/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "shocked", "definition": "very surprised and upset"},
    {"term": "evolve", "definition": "to change into a different form"},
    {"term": "wide-eyed", "definition": "with eyes opened very big"},
    {"term": "expression", "definition": "the look on someone''s face"},
    {"term": "jaw drop", "definition": "mouth opens from surprise"}
  ]'::jsonb,
  '[
    {"text": "Pikachu looks [BLANK] when Butterfree evolves.", "blanks": ["shocked"]},
    {"text": "The Pokemon''s [BLANK] shows complete surprise.", "blanks": ["expression"]},
    {"text": "Pikachu''s eyes go [BLANK] with amazement.", "blanks": ["wide"]}
  ]'::jsonb,
  true,
  null
),

-- 4. Blinking White Guy
(
  'Blinking White Guy',
  'Drew Scanlon blinks repeatedly while processing what he heard',
  'https://www.youtube.com/watch?v=KfDw0cgbaWU',
  'https://img.youtube.com/vi/KfDw0cgbaWU/maxresdefault.jpg',
  'intermediate',
  '[
    {"term": "blink", "definition": "to close and open your eyes quickly"},
    {"term": "process", "definition": "to think about and understand information"},
    {"term": "disbelief", "definition": "the feeling that something is not true"},
    {"term": "reaction", "definition": "the way someone responds to something"},
    {"term": "bewildered", "definition": "very confused"}
  ]'::jsonb,
  '[
    {"text": "He [BLANK] several times in confusion.", "blanks": ["blinks"]},
    {"text": "His face shows complete [BLANK].", "blanks": ["disbelief"]},
    {"text": "He seems [BLANK] by what he just heard.", "blanks": ["bewildered"]}
  ]'::jsonb,
  true,
  null
),

-- 5. Look at All Those Chickens
(
  'Look at All Those Chickens',
  'A little girl points at geese and calls them chickens',
  'https://www.youtube.com/shorts/NsLKQTh-Bqo',
  'https://img.youtube.com/vi/NsLKQTh-Bqo/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "point at", "definition": "to show something with your finger"},
    {"term": "geese", "definition": "plural of goose (large water birds)"},
    {"term": "mistake", "definition": "to think wrongly about something"},
    {"term": "confidently", "definition": "in a way that shows you are sure"},
    {"term": "adorable", "definition": "very cute and loveable"}
  ]'::jsonb,
  '[
    {"text": "The girl [BLANK] at the birds in the field.", "blanks": ["points"]},
    {"text": "She [BLANK] calls the geese ''chickens''.", "blanks": ["confidently"]},
    {"text": "The child makes an [BLANK] mistake.", "blanks": ["adorable"]}
  ]'::jsonb,
  true,
  null
),

-- 6. Road Work Ahead
(
  'Road Work Ahead',
  'Drew Gooden makes a pun about a road work sign while driving',
  'https://www.youtube.com/watch?v=6AYv6rV3NXE',
  'https://img.youtube.com/vi/6AYv6rV3NXE/maxresdefault.jpg',
  'intermediate',
  '[
    {"term": "pun", "definition": "a joke using words with double meanings"},
    {"term": "road work", "definition": "construction or repairs on a road"},
    {"term": "quip", "definition": "a clever or funny remark"},
    {"term": "deadpan", "definition": "showing no emotion when being funny"},
    {"term": "wordplay", "definition": "making jokes with word meanings"}
  ]'::jsonb,
  '[
    {"text": "He makes a clever [BLANK] about the sign.", "blanks": ["pun"]},
    {"text": "His [BLANK] delivery makes it funnier.", "blanks": ["deadpan"]},
    {"text": "The joke is based on [BLANK] with the phrase.", "blanks": ["wordplay"]}
  ]'::jsonb,
  true,
  null
),

-- 7. Hurricane Tortilla
(
  'Hurricane Tortilla',
  'A student misreads Hurricane Katrina as Hurricane Tortilla',
  'https://www.youtube.com/shorts/BdnXx5yMy3M',
  'https://img.youtube.com/vi/BdnXx5yMy3M/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "misread", "definition": "to read something incorrectly"},
    {"term": "hurricane", "definition": "a very strong storm with wind"},
    {"term": "tortilla", "definition": "a thin, flat Mexican bread"},
    {"term": "classroom", "definition": "a room where students learn"},
    {"term": "chart", "definition": "a paper showing information"}
  ]'::jsonb,
  '[
    {"text": "The student [BLANK] the word on the chart.", "blanks": ["misreads"]},
    {"text": "Instead of Katrina, he says [BLANK].", "blanks": ["tortilla"]},
    {"text": "This happens in a [BLANK] setting.", "blanks": ["classroom"]}
  ]'::jsonb,
  true,
  null
),

-- 8. Two Bros Chillin' in a Hot Tub
(
  'Two Bros Chillin'' in a Hot Tub',
  'Two guys sit in a hot tub five feet apart',
  'https://www.youtube.com/shorts/EwAajOtfNT8',
  'https://img.youtube.com/vi/EwAajOtfNT8/maxresdefault.jpg',
  'intermediate',
  '[
    {"term": "chillin''", "definition": "relaxing (informal)"},
    {"term": "hot tub", "definition": "a large bath with hot water and bubbles"},
    {"term": "five feet apart", "definition": "separated by five feet distance"},
    {"term": "bros", "definition": "brothers or close male friends (informal)"},
    {"term": "spa", "definition": "a place for relaxation and hot water"}
  ]'::jsonb,
  '[
    {"text": "Two friends are [BLANK] in the hot tub.", "blanks": ["chillin''"]},
    {"text": "They sit [BLANK] feet apart from each other.", "blanks": ["five"]},
    {"text": "The video takes place in a [BLANK].", "blanks": ["spa"]}
  ]'::jsonb,
  true,
  null
),

-- 9. Free Shavacado
(
  'Free Shavacado',
  'A person mispronounces Fresh Avocado as Free Shavacado',
  'https://www.youtube.com/shorts/N-HTRP8fz0Y',
  'https://img.youtube.com/vi/N-HTRP8fz0Y/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "mispronounce", "definition": "to say a word incorrectly"},
    {"term": "avocado", "definition": "a green fruit often used in salads"},
    {"term": "fresh", "definition": "recently made or picked"},
    {"term": "gleefully", "definition": "in a very happy and excited way"},
    {"term": "sign", "definition": "a board with writing on it"}
  ]'::jsonb,
  '[
    {"text": "The person [BLANK] the word ''avocado''.", "blanks": ["mispronounces"]},
    {"text": "They say it [BLANK] with excitement.", "blanks": ["gleefully"]},
    {"text": "The [BLANK] actually says ''Fresh Avocado''.", "blanks": ["sign"]}
  ]'::jsonb,
  true,
  null
),

-- 10. He Needs Some Milk
(
  'He Needs Some Milk',
  'Bystanders react to someone falling by shouting about milk',
  'https://www.youtube.com/watch?v=HRA1HyR1k8E',
  'https://img.youtube.com/vi/HRA1HyR1k8E/maxresdefault.jpg',
  'intermediate',
  '[
    {"term": "bystander", "definition": "a person who is near but not involved"},
    {"term": "shout", "definition": "to say something very loudly"},
    {"term": "react", "definition": "to respond to something that happens"},
    {"term": "fallen", "definition": "having dropped to the ground"},
    {"term": "remedy", "definition": "something that fixes a problem"}
  ]'::jsonb,
  '[
    {"text": "The [BLANK] see someone fall down.", "blanks": ["bystanders"]},
    {"text": "They [BLANK] that he needs milk.", "blanks": ["shout"]},
    {"text": "They think milk is the [BLANK] for falling.", "blanks": ["remedy"]}
  ]'::jsonb,
  true,
  null
),

-- 11. Deez Nuts
(
  'Deez Nuts',
  'WelvenDaGreat makes a prank call with a ''deez nuts'' punchline',
  'https://www.youtube.com/shorts/HHFFdy2NSdE',
  'https://img.youtube.com/vi/HHFFdy2NSdE/maxresdefault.jpg',
  'intermediate',
  '[
    {"term": "prank call", "definition": "a phone call made to trick someone"},
    {"term": "punchline", "definition": "the funny ending of a joke"},
    {"term": "got ''em", "definition": "successfully tricked them (informal)"},
    {"term": "setup", "definition": "the beginning part of a joke"},
    {"term": "deliver", "definition": "to say or perform something"}
  ]'::jsonb,
  '[
    {"text": "He makes a [BLANK] to trick someone.", "blanks": ["prank call"]},
    {"text": "The [BLANK] of the joke is ''deez nuts''.", "blanks": ["punchline"]},
    {"text": "He celebrates by saying [BLANK]!", "blanks": ["got ''em"]}
  ]'::jsonb,
  true,
  null
),

-- 12. Yeet (This B**** Empty!)
(
  'Yeet!',
  'A person throws an empty can while yelling YEET',
  'https://www.youtube.com/watch?v=2Bjy5YQ5xPc',
  'https://img.youtube.com/vi/2Bjy5YQ5xPc/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "yeet", "definition": "to throw something with force (slang)"},
    {"term": "hurl", "definition": "to throw something very hard"},
    {"term": "empty", "definition": "containing nothing inside"},
    {"term": "soda can", "definition": "a metal container for soft drinks"},
    {"term": "exclaim", "definition": "to say something loudly and suddenly"}
  ]'::jsonb,
  '[
    {"text": "The person [BLANK] the can with force.", "blanks": ["hurls"]},
    {"text": "They [BLANK] ''YEET!'' while throwing.", "blanks": ["exclaim"]},
    {"text": "The [BLANK] can flies through the air.", "blanks": ["empty"]}
  ]'::jsonb,
  true,
  null
),

-- 13. Drop My Croissant
(
  'You Made Me Drop My Croissant',
  'Someone gets startled and almost drops their croissant',
  'https://www.youtube.com/watch?v=ScSp4mGIrdE',
  'https://img.youtube.com/vi/ScSp4mGIrdE/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "startle", "definition": "to surprise and frighten someone"},
    {"term": "croissant", "definition": "a French pastry shaped like a moon"},
    {"term": "almost", "definition": "very nearly but not quite"},
    {"term": "upset", "definition": "unhappy or angry about something"},
    {"term": "pastry", "definition": "a baked food made with flour"}
  ]'::jsonb,
  '[
    {"text": "Someone [BLANK] the person holding food.", "blanks": ["startles"]},
    {"text": "They [BLANK] drop their croissant.", "blanks": ["almost"]},
    {"text": "The person sounds [BLANK] about it.", "blanks": ["upset"]}
  ]'::jsonb,
  true,
  null
),

-- 14. A Potato Flew Around My Room
(
  'A Potato Flew Around My Room',
  'A fan blows a potato around while music plays',
  'https://www.youtube.com/shorts/zLTZPK8HhFI',
  'https://img.youtube.com/vi/zLTZPK8HhFI/maxresdefault.jpg',
  'intermediate',
  '[
    {"term": "flew", "definition": "moved through the air (past of fly)"},
    {"term": "potato", "definition": "a round vegetable that grows underground"},
    {"term": "fan", "definition": "a machine that blows air"},
    {"term": "lyric", "definition": "words of a song"},
    {"term": "sync", "definition": "to match or go together with timing"}
  ]'::jsonb,
  '[
    {"text": "A [BLANK] makes the potato move.", "blanks": ["fan"]},
    {"text": "The potato [BLANK] around the room.", "blanks": ["flew"]},
    {"text": "The movement [BLANK] with the music.", "blanks": ["syncs"]}
  ]'::jsonb,
  true,
  null
),

-- 15. Oh My God, They Were Roommates
(
  'Oh My God, They Were Roommates',
  'Two people gossip and one gasps about roommates',
  'https://www.youtube.com/watch?v=FTdtnwTfUJQ',
  'https://img.youtube.com/vi/FTdtnwTfUJQ/maxresdefault.jpg',
  'intermediate',
  '[
    {"term": "gossip", "definition": "to talk about other people''s private lives"},
    {"term": "gasp", "definition": "to breathe in suddenly from surprise"},
    {"term": "roommates", "definition": "people who share a living space"},
    {"term": "pedestrian", "definition": "a person walking on the street"},
    {"term": "revelation", "definition": "surprising new information"}
  ]'::jsonb,
  '[
    {"text": "Two people are [BLANK] about others.", "blanks": ["gossiping"]},
    {"text": "One person [BLANK] in surprise.", "blanks": ["gasps"]},
    {"text": "The [BLANK] shocks the listener.", "blanks": ["revelation"]}
  ]'::jsonb,
  true,
  null
),

-- 16. Is That a Weed?
(
  'Is That a Weed?',
  'A boy holds a crayon while a friend dials 911 on a microwave',
  'https://www.youtube.com/shorts/g6cIYDvFS-U',
  'https://img.youtube.com/vi/g6cIYDvFS-U/maxresdefault.jpg',
  'intermediate',
  '[
    {"term": "brandish", "definition": "to wave something in a threatening way"},
    {"term": "crayon", "definition": "a colored wax stick for drawing"},
    {"term": "dial", "definition": "to enter a phone number"},
    {"term": "microwave", "definition": "an appliance that heats food quickly"},
    {"term": "absurd", "definition": "completely silly or ridiculous"}
  ]'::jsonb,
  '[
    {"text": "The boy [BLANK] a crayon dramatically.", "blanks": ["brandishes"]},
    {"text": "His friend tries to [BLANK] 911.", "blanks": ["dial"]},
    {"text": "The situation is completely [BLANK].", "blanks": ["absurd"]}
  ]'::jsonb,
  true,
  null
),

-- 17. Why You Always Lyin'
(
  'Why You Always Lyin''',
  'Nicholas Fraser sings about someone who always lies',
  'https://www.youtube.com/shorts/Q_dISj7a4Us',
  'https://img.youtube.com/vi/Q_dISj7a4Us/maxresdefault.jpg',
  'intermediate',
  '[
    {"term": "lyin''", "definition": "lying; not telling the truth (informal)"},
    {"term": "parody", "definition": "a funny copy of something serious"},
    {"term": "call out", "definition": "to criticize someone publicly"},
    {"term": "R&B", "definition": "rhythm and blues music style"},
    {"term": "track", "definition": "a piece of recorded music"}
  ]'::jsonb,
  '[
    {"text": "The song is a [BLANK] of an R&B track.", "blanks": ["parody"]},
    {"text": "He [BLANK] someone for not being honest.", "blanks": ["calls out"]},
    {"text": "The person is always [BLANK] to him.", "blanks": ["lyin''"]}
  ]'::jsonb,
  true,
  null
),

-- 18. What Are Those?!
(
  'What Are Those?!',
  'Someone points at shoes and loudly asks what they are',
  'https://www.youtube.com/watch?v=MFTBu5x3Z1I',
  'https://img.youtube.com/vi/MFTBu5x3Z1I/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "point at", "definition": "to show something with your finger"},
    {"term": "shoes", "definition": "things you wear on your feet"},
    {"term": "officer", "definition": "a police person"},
    {"term": "mock", "definition": "to make fun of something"},
    {"term": "footwear", "definition": "things worn on feet"}
  ]'::jsonb,
  '[
    {"text": "The person [BLANK] at the officer''s shoes.", "blanks": ["points"]},
    {"text": "They seem to [BLANK] the footwear.", "blanks": ["mock"]},
    {"text": "The [BLANK] is the target of the joke.", "blanks": ["officer"]}
  ]'::jsonb,
  true,
  null
),

-- 19. Kazoo Kid "Wow!"
(
  'Kazoo Kid',
  'A cheerful child exclaims WOW while playing kazoo',
  'https://www.youtube.com/watch?v=L2quonm59Kc',
  'https://img.youtube.com/vi/L2quonm59Kc/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "kazoo", "definition": "a simple musical instrument you hum into"},
    {"term": "exclaim", "definition": "to say something loudly with excitement"},
    {"term": "cheerful", "definition": "happy and positive"},
    {"term": "enthusiasm", "definition": "strong excitement and interest"},
    {"term": "instrument", "definition": "something used to make music"}
  ]'::jsonb,
  '[
    {"text": "The child [BLANK] ''WOW!'' loudly.", "blanks": ["exclaims"]},
    {"text": "He plays a [BLANK] with enthusiasm.", "blanks": ["kazoo"]},
    {"text": "His [BLANK] mood is contagious.", "blanks": ["cheerful"]}
  ]'::jsonb,
  true,
  null
),

-- 20. Hehe Boi
(
  'Hehe Boi',
  'A cartoon character makes a mischievous laugh',
  'https://www.youtube.com/watch?v=HgFMr076nNQ',
  'https://img.youtube.com/vi/HgFMr076nNQ/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "leer", "definition": "to look at someone in an unpleasant way"},
    {"term": "mischievous", "definition": "playfully causing trouble"},
    {"term": "cartoon", "definition": "an animated drawing"},
    {"term": "character", "definition": "a person in a story or show"},
    {"term": "chuckle", "definition": "a quiet laugh"}
  ]'::jsonb,
  '[
    {"text": "The character has a [BLANK] expression.", "blanks": ["mischievous"]},
    {"text": "He [BLANK] at the camera creepily.", "blanks": ["leers"]},
    {"text": "The [BLANK] character says ''hehe boi''.", "blanks": ["cartoon"]}
  ]'::jsonb,
  true,
  null
),

-- 21. Shooting Stars
(
  'Shooting Stars',
  'A subject drifts through psychedelic space to music',
  'https://www.youtube.com/watch?v=AJpL24_YDUc',
  'https://img.youtube.com/vi/AJpL24_YDUc/maxresdefault.jpg',
  'advanced',
  '[
    {"term": "drift", "definition": "to move slowly without control"},
    {"term": "psychedelic", "definition": "having bright colors and strange patterns"},
    {"term": "seagull", "definition": "a white bird that lives near the sea"},
    {"term": "surreal", "definition": "strange like a dream"},
    {"term": "float", "definition": "to move gently on air or water"}
  ]'::jsonb,
  '[
    {"text": "The subject [BLANK] through colorful space.", "blanks": ["drifts"]},
    {"text": "The visuals are very [BLANK].", "blanks": ["psychedelic"]},
    {"text": "Everything looks [BLANK] and dreamlike.", "blanks": ["surreal"]}
  ]'::jsonb,
  true,
  null
),

-- 22. Pen-Pineapple-Apple-Pen (PPAP)
(
  'PPAP - Pen Pineapple Apple Pen',
  'Pikotaro combines a pen, pineapple, and apple in a catchy song',
  'https://www.youtube.com/watch?v=0E00Zuayv9Q',
  'https://img.youtube.com/vi/0E00Zuayv9Q/maxresdefault.jpg',
  'intermediate',
  '[
    {"term": "combine", "definition": "to put two or more things together"},
    {"term": "catchy", "definition": "easy to remember (about music)"},
    {"term": "nonsensical", "definition": "having no meaning or logic"},
    {"term": "viral", "definition": "spreading quickly on the internet"},
    {"term": "gesture", "definition": "a movement that expresses something"}
  ]'::jsonb,
  '[
    {"text": "The song is very [BLANK] and memorable.", "blanks": ["catchy"]},
    {"text": "He [BLANK] different objects together.", "blanks": ["combines"]},
    {"text": "The lyrics are completely [BLANK].", "blanks": ["nonsensical"]}
  ]'::jsonb,
  true,
  null
),

-- 23. It's an Avocado... Thanks!
(
  'It''s an Avocado... Thanks!',
  'A child politely thanks someone for an avocado Christmas gift',
  'https://www.youtube.com/shorts/k-cavEKkirc',
  'https://img.youtube.com/vi/k-cavEKkirc/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "unwrap", "definition": "to remove paper from a gift"},
    {"term": "politely", "definition": "in a nice and respectful way"},
    {"term": "avocado", "definition": "a green fruit with a large seed"},
    {"term": "grateful", "definition": "feeling thankful"},
    {"term": "Christmas", "definition": "a holiday celebrated in December"}
  ]'::jsonb,
  '[
    {"text": "The child [BLANK] the unusual gift.", "blanks": ["unwraps"]},
    {"text": "He [BLANK] thanks the gift giver.", "blanks": ["politely"]},
    {"text": "He seems [BLANK] for the avocado.", "blanks": ["grateful"]}
  ]'::jsonb,
  true,
  null
),

-- 24. What's 9 + 10? – 21
(
  'What''s 9 + 10? 21!',
  'A child confidently gives the wrong answer to a math question',
  'https://www.youtube.com/watch?v=imqn0acHArw',
  'https://img.youtube.com/vi/imqn0acHArw/maxresdefault.jpg',
  'beginner',
  '[
    {"term": "math", "definition": "the study of numbers"},
    {"term": "confident", "definition": "very sure about something"},
    {"term": "incorrect", "definition": "wrong; not right"},
    {"term": "addition", "definition": "putting numbers together"},
    {"term": "insist", "definition": "to say something is true even when questioned"}
  ]'::jsonb,
  '[
    {"text": "The child answers the [BLANK] question wrong.", "blanks": ["math"]},
    {"text": "He [BLANK] says the answer is 21.", "blanks": ["confidently"]},
    {"text": "He [BLANK] his answer is correct.", "blanks": ["insists"]}
  ]'::jsonb,
  true,
  null
),

-- 25. Rickroll
(
  'Never Gonna Give You Up (Rickroll)',
  'Rick Astley''s famous song used to trick people online',
  'https://www.youtube.com/watch?v=QNXvE1BZu8g',
  'https://img.youtube.com/vi/QNXvE1BZu8g/maxresdefault.jpg',
  'intermediate',
  '[
    {"term": "rickroll", "definition": "to trick someone into watching this video"},
    {"term": "bait", "definition": "something used to attract or trick"},
    {"term": "internet prank", "definition": "a joke played online"},
    {"term": "iconic", "definition": "very famous and representing something"},
    {"term": "mislead", "definition": "to make someone believe something false"}
  ]'::jsonb,
  '[
    {"text": "People use this video to [BLANK] others.", "blanks": ["rickroll"]},
    {"text": "The song has become [BLANK] on the internet.", "blanks": ["iconic"]},
    {"text": "Links often [BLANK] people to this video.", "blanks": ["mislead"]}
  ]'::jsonb,
  true,
  null
);