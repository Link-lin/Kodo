"use client";

import * as React from "react";

type CardDragContextValue = {
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
};

const CardDragContext = React.createContext<CardDragContextValue>({});

export function CardDragProvider({
  value,
  children,
}: {
  value: CardDragContextValue;
  children: React.ReactNode;
}) {
  return (
    <CardDragContext.Provider value={value}>
      {children}
    </CardDragContext.Provider>
  );
}

export function useCardDrag() {
  return React.useContext(CardDragContext);
}
