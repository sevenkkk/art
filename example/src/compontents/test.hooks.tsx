import { makeQuery } from 'art'
type EventModel = { eventID: string; eventName: string }

export const eventListStore = makeQuery<EventModel[]>(
  '/app/event/popup/list',
  {
    onSuccess: () => {
      eventListStore2.run().then()
    }
  }
)

export const eventListStore2 = makeQuery<EventModel[]>(
  '/app/event/popup/list'
)
