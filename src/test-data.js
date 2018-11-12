const DATABASE = [
  {
    collection: 'users',
    documents: [
      {
        _id: 'u_0',
        email: 'u_0@nicecalendar.com',
        username: 'username_0',
        timezone: 'America/Los_Angeles',
      },
    ],
  },
  {
    collection: 'events',
    documents: [
      {
        _id: 'e_0',
        userId: 'u_0',
        title: 'Important meeting',
        startDatetime: new Date('2018-11-20T13:24:00Z'),
        isRecurring: false,
        recurringSchedule: null,
        tags: ['work', 'important'],
      },
      {
        _id: 'e_1',
        userId: 'u_0',
        title: 'Bi-Weekly jousting sesh long long title',
        startDatetime: new Date('2018-10-15T08:10:00Z'),
        isRecurring: true,
        recurringSchedule: {
          repetitionType: 'everyXUnits',
          everyX: 2,
          everyUnit: 'week',
        },
        tags: [],
      },
    ],
  },
  {
    collection: 'occurrences',
    documents: [
      {
        _id: 'o_0',
        userId: 'u_0',
        eventId: 'e_0',
        datetime: new Date('2018-10-20T13:24:00Z'),
        checkedOff: false,
      },
      {
        _id: 'o_1',
        userId: 'u_0',
        eventId: 'e_1',
        datetime: new Date('2018-10-25T08:10:00Z'),
        checkedOff: true,
      },
      {
        _id: 'o_2',
        userId: 'u_0',
        eventId: 'e_1',
        datetime: new Date('2018-10-26T08:10:00Z'),
        checkedOff: false,
      },
      {
        _id: 'o_2',
        userId: 'u_0',
        eventId: 'e_1',
        datetime: new Date('2018-10-27T08:10:00Z'),
        checkedOff: false,
      },
    ],
  },
];

export default DATABASE;
