import { createQueryStore } from 'art'
type EventModel = { eventID: string; eventName: string }

export const eventListStore = createQueryStore<EventModel[]>(
  '/app/event/popup/list',
  {
    successCallback: () => {
      eventListStore2.run().then()
    }
  }
)

export const eventListStore2 = createQueryStore<EventModel[]>(
  '/app/event/popup/list'
)
