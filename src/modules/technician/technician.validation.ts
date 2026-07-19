// const addAvailabilitySchema = z.object({
//   body: z.object({
//     date: z.string().date(), // "YYYY-MM-DD"
//     startTime: z.string().regex(timeRegex, "startTime must be in HH:mm format"),
//     endTime: z.string().regex(timeRegex, "endTime must be in HH:mm format"),
//   }),
// });