import React, { createContext, useState, useContext } from 'react';

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [scheduleLoadingGlobal, setScheduleLoadingGlobal] = useState(false);
  return (
    <ScheduleContext.Provider value={{ scheduleLoadingGlobal, setScheduleLoadingGlobal }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => useContext(ScheduleContext);
