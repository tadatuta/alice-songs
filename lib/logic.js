const got = require('got');
const apiUrl = 'https://api.music.yandex.net';

function getLyricsSubset(query, fullLyrics) {
    const normalizedLyrics = fullLyrics.toLowerCase().replace(/\s+/, ' ');

    const [before, after, ...rest] = normalizedLyrics.split(query);
    const subset = (after ?
            after + rest.join(' ') :
            getFuzzyLyricsSubset(query, before)
        ).split(' ');

    // to satisfy Alice API requirements
    subset.length = Math.min(subset.length, 16);

    return subset.join(' ');
}

// TODO: try to find query in subset instead
function getFuzzyLyricsSubset(query, subset) {
    return subset;
}

module.exports = function(data) {
    if (data.session.new) return 'Из песни слов не выкинешь. Скажи и я продолжу!';

    const command = data.request.command.toLowerCase();

    return got(`${apiUrl}/search?type=all&page=0&text=${encodeURIComponent(command)}`)
        .then(res => JSON.parse(res.body))
        .then(async searchData => {
            const results = searchData.result.tracks.results;

            for (let i = 0; i < results.length; i += 1) {
                const track = results[i];

                const supplement = await got(`${apiUrl}/tracks/${track.id}/supplement/`)
                    .then(res => JSON.parse(res.body));

                const lyrics = supplement.result.lyrics;

                if (lyrics && lyrics.fullLyrics) {
                    return getLyricsSubset(command, lyrics.fullLyrics);
                }
            }

            return 'Нет такого имени!';
        })
        .catch(err => {
            console.error(err);
            return 'Ой, что-то пошло не так!';
        });
};
