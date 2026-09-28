/* Melhorias de calendário sem alterar o núcleo do app. */
(function () {
  const baseOverlapsDay = overlapsDay;
  overlapsDay = function (event, day) {
    const mode = event.calendar?.mode || (event.calendar?.enabled === false ? 'hidden' : 'span');
    if (mode === 'hidden') return false;

    const range = getBrazilRange(event);
    if (!range.start || !range.end) return false;

    if (mode === 'start') {
      return startOfDay(range.start).getTime() === startOfDay(day).getTime();
    }

    return baseOverlapsDay(event, day);
  };

  const baseRenderEvents = renderEvents;
  renderEvents = function (events) {
    if (arguments.length === 0 || events === state.events) {
      const now = new Date();
      const visible = state.events.filter((event) => {
        const { end } = getBrazilRange(event);
        return end && end >= now;
      });
      return baseRenderEvents(visible);
    }
    return baseRenderEvents(events);
  };
})();
