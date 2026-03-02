import * as React from "react";

type Subscriber<T> = (value: T) => void;

interface MockMotionValue<T> {
  get: () => T;
  set: (nextValue: T) => void;
  on: (_event: string, handler: Subscriber<T>) => () => void;
}

function createMotionValue<T>(initialValue: T): MockMotionValue<T> {
  let value = initialValue;
  const subscribers = new Set<Subscriber<T>>();

  return {
    get: () => value,
    set: (nextValue: T) => {
      value = nextValue;
      subscribers.forEach((subscriber) => {
        subscriber(value);
      });
    },
    on: (_event: string, handler: Subscriber<T>) => {
      subscribers.add(handler);
      return () => {
        subscribers.delete(handler);
      };
    }
  };
}

const motion = new Proxy(
  {},
  {
    get: (_target, elementName: string) =>
      React.forwardRef((props: any, ref: any) =>
        React.createElement(elementName, {
          ref,
          ...props
        })
      )
  }
) as Record<string, React.ForwardRefExoticComponent<any>>;

function AnimatePresence({ children }: { children?: React.ReactNode }): React.ReactElement {
  return React.createElement(React.Fragment, null, children);
}

function animate<T>(value: MockMotionValue<T>, nextValue: T): { stop: () => void } {
  value.set(nextValue);
  return {
    stop: () => {}
  };
}

function useMotionValue<T>(initialValue: T): MockMotionValue<T> {
  const ref = React.useRef<MockMotionValue<T>>();
  if (!ref.current) {
    ref.current = createMotionValue(initialValue);
  }

  return ref.current;
}

function useTransform<T, R>(
  value: MockMotionValue<T>,
  transformer: (latest: T) => R
): MockMotionValue<R> {
  const transformed = useMotionValue<R>(transformer(value.get()));

  React.useEffect(() => {
    return value.on("change", (nextValue) => {
      transformed.set(transformer(nextValue));
    });
  }, [transformer, transformed, value]);

  return transformed;
}

export { AnimatePresence, animate, motion, useMotionValue, useTransform };
