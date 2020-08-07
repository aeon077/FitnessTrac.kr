const { client } = require('./client');

//creating initial preloaded activities
async function createInitialActivities() {
    try {
        console.log("Starting to create activities...");

        await createActivity({
            name: 'Ashtanga Yoga',
            description: 'Ashtanga yoga focuses on breathing while participants move through a series progressing poses (asanas).  This type of yoga tends to be more vigorous and fast-paced.',
        });

        await createActivity({
            name: 'Hatha Yoga',
            description: 'This class focuses primarily on the practice of physical postures (asanas) and breathing  exercises/techniques (pranayamas) and is suitable for all levels of flexibility.',
        })

        await createActivity({
            name: 'Pilates',
            description: 'Pilates is a system of specific movements developed by the late Joseph Pilates, for physical and  mental conditioning.  Pilates not only enhances physical strength, especially the core, but improves flexibility and coordination, reduces stress, and improves mental focus.  Some equipment may be utilized such as  resist-a-balls, bender balls, magic circles, light hand weights, or yoga straps.',
        })

        await createActivity({
            name: 'Vinyasa Yoga',
            description: 'Vinyasa yoga focuses on the continuous flow from one pose to the next.  This type of yoga tends to be fast-paced.'
        })

        await createActivity({
            name: 'situps',
            description: 'Situps are classic abdominal exercises done by lying on your back and lifting your torso.'
        })

        await createActivity({
            name: 'pushups',
            description: 'exercise done laying with face, palms and toes facing down, keeping legs and back straight, extending arms straight to push body up and back down again. An example of a push-up is a great exercise that works the chest, shoulder and arm muscles.'
        })

        await createActivity({
            name: 'squats',
            description: 'A squat is a strength exercise in which the trainee lowers their hips from a standing position and then stands back up.'
        })


        console.log("Finished creating activities!");
    } catch (error) {
        console.error("Error creating activities!");
        throw error;
    }
}

//select and return an array of all activities
async function getAllActivities() {
    try {
        const { rows } = await client.query(`
      SELECT id, name, description, active 
      FROM activities;
    `);

        return rows;
    } catch (error) {
        throw error;
    }
};

//createActivity({ name, description })
//return the new activity
async function createActivity({
    name,
    description,
}) {
    try {
        const { rows: [activity] } = await client.query(`
      INSERT INTO activities (name, description) 
      VALUES($1, $2) 
      ON CONFLICT (name) DO NOTHING 
      RETURNING *;
    `, [name, description]);

        return activity;
    } catch (error) {
        throw error;
    }
}

//updateActivity({ id, name, description })
//don't try to update the id
//do update the name and description 
//return the updated activity
async function updateActivity({ id, fields = {} }) {
    //setString for mapping out name and description
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [activity] } = await client.query(`
        UPDATE activities
        SET ${ setString}
        WHERE id=${ id}
        RETURNING *;
        `, Object.values(fields));

        return activity;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    client,
    getAllActivities,
    createActivity,
    createInitialActivities,
    updateActivity
}