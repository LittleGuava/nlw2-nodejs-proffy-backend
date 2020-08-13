import express, { request } from 'express';
import db from './database/connection';
import convertHourToMinutes from './utils/convertHourToMinutes';

const routes = express.Router();

interface ScheduleItem {
    week_day:string,
    from:string,
    to:string,
}

routes.post('/classes', async (request, response) => {
    const trx = await db.transaction();
    try {

    const {
        name,
        avatar, 
        whatsapp,
        bio, 
        subject,
        cost,
        schedule
    } = request.body;


    const insertUsersIds = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio,
    });

    const user_id = insertUsersIds[0]

    const insertedClassesIds = await trx('classes').insert({
        subject,
        cost,
        user_id,
    });

    const class_id = insertedClassesIds[0];

    const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
        return{
            week_day: scheduleItem.week_day,
            from: convertHourToMinutes(scheduleItem.from),
            to: convertHourToMinutes(scheduleItem.to),
        };
    });

    await trx('classes').insert(classSchedule);

    await trx.commit();

    return response.status(200).json('Succesfully!');

} catch (err) {
    await trx.rollback();

    return response.status(400).json('oh noes!');
}
});

export default routes;