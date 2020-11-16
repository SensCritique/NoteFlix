import VideoTypeEnum from './VideoTypeEnum'

export default class AllocineClient {
    private readonly searchUrl: string;
    private movieRatingUrl: string;
    private serieRatingUrl: string;
    private failRedirectUrl: string;

    constructor() {
        this.searchUrl = 'https://www.allocine.fr/_/autocomplete/'
        this.movieRatingUrl = 'https://www.allocine.fr/film/fichefilm-%id%/critiques/spectateurs/'
        this.serieRatingUrl = 'https://www.allocine.fr/series/ficheserie-%id%/critiques/'
        this.failRedirectUrl = 'https://www.allocine.fr/recherche/?q=%s'
    }

    async getVideoInfo(search, year = null, type) {
        if (search) {
            const url = this.searchUrl + encodeURI(search)
            const response = await fetch(url)
            let videoInfo = null
            if (response.ok) {
                const body = await response.json()
                if (!body.error && body.results.length > 0) {
                    for (const result of body.results) {
                        if (result.entity_type === type &&
                            ((type === VideoTypeEnum.SERIE) || (type === VideoTypeEnum.MOVIE && result.data.year === year))) {
                            videoInfo = {
                                name: search,
                                redirect: this.buildRatingUrl(result.entity_id, result.entity_type),
                                id: result.entity_id,
                                type: type
                            }
                            break
                        }
                    }
                }
            }

            if (videoInfo) {
                const response = await fetch(this.buildRatingUrl(videoInfo.id, videoInfo.type))
                if (response.ok) {
                    const html = await response.text()
                    const parser = new DOMParser()
                    const dom = parser.parseFromString(html, 'text/html')
                    const note: HTMLElement = dom.documentElement.querySelector('.note')
                    videoInfo.rating = note ? note.innerText : null

                    return videoInfo
                }
            }

            return {
                name: search,
                id: null,
                type: null,
                redirect: this.buildRedirectUrl(search)
            }
        }
    }

    buildRatingUrl(id, type) {
        if (type === 'movie') {
            return this.movieRatingUrl.replace('%id%', id)
        }
        if (type === 'series') {
            return this.serieRatingUrl.replace('%id%', id)
        }

        return null
    };

    buildRedirectUrl(videoName) {
        return this.failRedirectUrl.replace('%s', encodeURI(videoName))
    }
}
