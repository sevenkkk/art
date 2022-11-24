import { makeFetch } from 'art'
type EventModel = { eventID: string; eventName: string }

export const eventListStore = makeFetch<EventModel[]>('/app/event/popup/list', {
  onSuccess: () => {
    eventListStore2.run().then()
  }
})

export const eventListStore2 = makeFetch<EventModel[]>('/app/event/popup/list')
