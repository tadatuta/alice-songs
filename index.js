const { json } = require('micro');
const getResponse = require('./lib/logic');

module.exports = async req => {
    const { request, session, version } = await json(req);
    const text = await getResponse({ request, session });

    return {
        version,
        session,
        response: {
            text,

            end_session: false
        }
    };
};
