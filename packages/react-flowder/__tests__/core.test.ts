import { createStore } from "@naporin0624/simple-store";
import { EMPTY, interval, map, Observable, Subject, Subscription } from "rxjs";

import { datasource, DatasourceKey, DatasourceResolverImpl, fromAsyncFunction, getSource, Status } from "../src/core";

describe("datasource test", () => {
  const timer = interval();
  const timerResource = datasource(() => timer);
  const emptyResource = datasource(() => EMPTY);
  const withArgs = datasource((a: number) => timer.pipe(map((t) => t + a)));

  const notObservableFlowder = datasource(() => 1 as unknown as Observable<never>);

  test("key test", () => {
    expect(typeof timerResource.toString).toEqual("function");
    expect(typeof timerResource.toString()).toEqual("string");
    expect(timerResource.toString().startsWith("datasource__")).toEqual(true);
  });
  test("unique key test", () => {
    expect(timerResource()).toEqual(timerResource());
    expect(timerResource()).not.toEqual(emptyResource());

    expect(withArgs(1)).toEqual(withArgs(1));
    expect(withArgs(1)).not.toEqual(withArgs(2));
  });
  test("get source test", () => {
    expect(getSource(timerResource())).toEqual(timer);
    expect(getSource(timerResource())).not.toEqual(emptyResource());
    expect(getSource(timerResource())).not.toEqual(withArgs(0));
  });
  test("not observable test", () => {
    expect(() => getSource(notObservableFlowder())).toThrowError(new Error("The registered Object is not an Observable."));
  });

  test("change key test", () => {
    expect(() => getSource("" as DatasourceKey<unknown>)).toThrowError(new Error("This datasource has not been registered."));
  });

  test("input promise", () => {
    const resource = fromAsyncFunction((number: number) => Promise.resolve(number));

    expect(() => getSource(resource(1))).not.toThrow();
    expect(getSource(resource(1)) instanceof Observable).toBeTruthy();
  });
});

describe("datasourceResolver test", () => {
  const subject = new Subject<unknown>();
  const any = datasource(() => subject);
  const timer = datasource(() => interval());

  describe("testing register method", () => {
    const subscriptions = new Map<DatasourceKey<unknown>, Subscription>();
    const cache = createStore<DatasourceKey<unknown>, Status<unknown>>();
    const resolver = new DatasourceResolverImpl(subscriptions, cache);
    afterEach(() => {
      subscriptions.clear();
      cache.clear();
      resolver.cancelAll();
      jest.clearAllMocks();
    });

    test("register を何度行っても subscribe は一度しか実行されない", () => {
      const spy = jest.spyOn(subject, "subscribe");
      expect(spy.mock.calls.length).toEqual(0);

      resolver.register(any());
      expect(spy.mock.calls.length).toEqual(1);

      resolver.register(any());
      expect(spy.mock.calls.length).toEqual(1);
    });

    test("register を行うと subscription が生成される", () => {
      expect(subscriptions.has(any())).toBeFalsy();
      resolver.register(any());
      expect(subscriptions.has(any())).toBeTruthy();
    });

    test("register を行うと cache にデータがセットされる", () => {
      resolver.register(any());
      subject.next(1);
      expect(cache.get(any())).toEqual({ type: "success", data: 1 });
    });
  });

  describe("testing cancel method", () => {
    const subscriptions = new Map<DatasourceKey<unknown>, Subscription>();
    const resolver = new DatasourceResolverImpl(subscriptions);

    afterEach(() => {
      subscriptions.clear();
      resolver.cancelAll();
      jest.clearAllMocks();
    });

    test("register した後に cancel すると subscription が消える", () => {
      resolver.register(any());
      expect(subscriptions.has(any())).toBeTruthy();
      resolver.cancel(any());
      expect(subscriptions.has(any())).toBeFalsy();
    });
  });

  describe("testing cancelAll method", () => {
    const subscriptions = new Map<DatasourceKey<unknown>, Subscription>();
    const resolver = new DatasourceResolverImpl(subscriptions);
    afterEach(() => {
      subscriptions.clear();
      resolver.cancelAll();
      jest.clearAllMocks();
    });

    test("全ての subscription が消える", () => {
      resolver.register(any());
      resolver.register(timer());
      expect(subscriptions.size).toEqual(2);
      resolver.cancelAll();
      expect(subscriptions.size).toEqual(0);
    });
  });

  describe("testing watchStatus method", () => {
    const resolver = new DatasourceResolverImpl();

    test("success test", (done) => {
      const subject = new Subject();
      const resource = datasource(() => subject);
      resolver.register(resource());

      const subscription = resolver.watchStatus(resource()).subscribe({
        next(value) {
          expect(value).toEqual({ type: "success", data: 1 });
          done();
        },
      });

      subject.next(1);
      expect(subscription.unsubscribe).not.toThrow();
    });

    test("error test", (done) => {
      const subject = new Subject();
      const error = new Error();
      const resource = datasource(() => subject);

      resolver.register(resource());
      const status = resolver.getStatus(resource());
      const subscription = resolver.watchStatus(resource()).subscribe({
        next(value) {
          expect(value).toEqual({ type: "error", data: error });
          done();
        },
      });

      subject.error(error);
      expect(status.data).rejects.toThrow();
      expect(subscription.unsubscribe).not.toThrow();
    });
  });

  describe("testing getStatus method", () => {
    const resolver = new DatasourceResolverImpl();

    test("pending", async () => {
      const subject = new Subject();
      const resource = datasource(() => subject);
      resolver.register(resource());

      const status = resolver.getStatus(resource());
      subject.next(1);

      expect(status.type).toEqual("pending");
      await expect(status.data).resolves.toEqual(1);
    });

    test("success", () => {
      const subject = new Subject();
      const resource = datasource(() => subject);
      resolver.register(resource());

      subject.next(1);
      const status = resolver.getStatus(resource());

      expect(status.type).toEqual("success");
      expect(status.data).toEqual(1);
    });
    test("error", async () => {
      const subject = new Subject();
      const resource = datasource(() => subject);
      resolver.register(resource());
      const error = new Error();

      const pending = resolver.getStatus(resource());
      subject.error(error);

      expect(pending.type).toEqual("pending");
      await expect(pending.data).rejects.toThrow();

      const status = resolver.getStatus(resource());
      expect(status.type).toEqual("error");
      expect(status.data).toEqual(error);
    });
  });

  describe("testing writeCache method", () => {
    const cache = createStore<DatasourceKey<unknown>, Status>();
    const resolver = new DatasourceResolverImpl(undefined, cache);
    test("キャッシュを書き込める", () => {
      const resource = datasource(() => new Subject());
      const status: Status = { type: "success", data: 1 };
      resolver.writeCache(resource(), status);

      expect(cache.get(resource())).toEqual(status);
    });
  });

  describe("testing resetCache method", () => {
    const resolver = new DatasourceResolverImpl();
    afterEach(() => {
      resolver.cancelAll();
      jest.clearAllMocks();
    });

    test("空引数で reset したときは全てのキャッシュが reset される", () => {
      const subject = new Subject();
      const resource1 = datasource(() => subject);
      resolver.register(resource1());

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const resource2 = datasource((args: number) => subject);
      resolver.register(resource2(1));
      resolver.register(resource2(2));

      subject.next(1);
      expect(resolver.getStatus(resource1())).toEqual({ type: "success", data: 1 });
      expect(resolver.getStatus(resource2(1))).toEqual({ type: "success", data: 1 });
      expect(resolver.getStatus(resource2(2))).toEqual({ type: "success", data: 1 });

      resolver.resetCache();
      expect(resolver.getStatus(resource1()).type).toEqual("pending");
      expect(resolver.getStatus(resource2(1)).type).toEqual("pending");
      expect(resolver.getStatus(resource2(2)).type).toEqual("pending");
    });

    test("datasource で reset したときは datasource によって作られるキャッシュが reset される", () => {
      const subject = new Subject();
      const resource1 = datasource(() => subject);
      resolver.register(resource1());

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const resource2 = datasource((args: number) => subject);
      resolver.register(resource2(1));
      resolver.register(resource2(2));

      subject.next(1);
      expect(resolver.getStatus(resource1())).toEqual({ type: "success", data: 1 });
      expect(resolver.getStatus(resource2(1))).toEqual({ type: "success", data: 1 });
      expect(resolver.getStatus(resource2(2))).toEqual({ type: "success", data: 1 });

      resolver.resetCache(resource2);
      expect(resolver.getStatus(resource1()).type).toEqual("success");
      expect(resolver.getStatus(resource2(1)).type).toEqual("pending");
      expect(resolver.getStatus(resource2(2)).type).toEqual("pending");
    });

    test("datasourceKey を引数に入れた時は datasourceKey のキャッシュが reset される", () => {
      const subject = new Subject();
      const resource1 = datasource(() => subject);
      resolver.register(resource1());

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const resource2 = datasource((args: number) => subject);
      resolver.register(resource2(1));
      resolver.register(resource2(2));

      subject.next(1);
      expect(resolver.getStatus(resource1())).toEqual({ type: "success", data: 1 });
      expect(resolver.getStatus(resource2(1))).toEqual({ type: "success", data: 1 });
      expect(resolver.getStatus(resource2(2))).toEqual({ type: "success", data: 1 });

      resolver.resetCache(resource2(1));
      expect(resolver.getStatus(resource1()).type).toEqual("success");
      expect(resolver.getStatus(resource2(1)).type).toEqual("pending");
      expect(resolver.getStatus(resource2(2)).type).toEqual("success");
    });
  });
});
