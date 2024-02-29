var GrafanaFaroWebSdk = (function (e) {
  "use strict";
  function n(e, n) {
    return typeof e === n;
  }
  function t(e, n) {
    return Object.prototype.toString.call(e) === `[object ${n}]`;
  }
  function i(e, n) {
    try {
      return e instanceof n;
    } catch (e) {
      return !1;
    }
  }
  const o = (e) => n(e, "null"),
    r = (e) => n(e, "string"),
    s = (e) => (n(e, "number") && !isNaN(e)) || n(e, "bigint"),
    a = (e) => !o(e) && n(e, "object"),
    l = (e) => n(e, "function"),
    u = (e) => t(e, "Array"),
    c = (e) => !a(e) && !l(e),
    d = "undefined" != typeof Event,
    p = (e) => d && i(e, Event),
    f = "undefined" != typeof Error,
    g = (e) => f && i(e, Error),
    m = (e) => t(e, "ErrorEvent"),
    v = (e) => t(e, "DOMError"),
    b = (e) => t(e, "DOMException"),
    h = "undefined" != typeof Element,
    w = "undefined" != typeof Map;
  function y(e, t) {
    if (e === t) return !0;
    if (n(e, "number") && isNaN(e)) return n(t, "number") && isNaN(t);
    const i = u(e),
      o = u(t);
    if (i !== o) return !1;
    if (i && o) {
      const n = e.length;
      if (n !== t.length) return !1;
      for (let i = n; 0 != i--; ) if (!y(e[i], t[i])) return !1;
      return !0;
    }
    const r = a(e),
      s = a(t);
    if (r !== s) return !1;
    if (e && t && r && s) {
      const n = Object.keys(e),
        i = Object.keys(t);
      if (n.length !== i.length) return !1;
      for (let e of n) if (!i.includes(e)) return !1;
      for (let i of n) if (!y(e[i], t[i])) return !1;
      return !0;
    }
    return !1;
  }
  function S() {
    return new Date().toISOString();
  }
  var E;
  (e.LogLevel = void 0),
    ((E = e.LogLevel || (e.LogLevel = {})).TRACE = "trace"),
    (E.DEBUG = "debug"),
    (E.INFO = "info"),
    (E.LOG = "log"),
    (E.WARN = "warn"),
    (E.ERROR = "error");
  const T = e.LogLevel.LOG,
    k = [
      e.LogLevel.TRACE,
      e.LogLevel.DEBUG,
      e.LogLevel.INFO,
      e.LogLevel.LOG,
      e.LogLevel.WARN,
      e.LogLevel.ERROR,
    ];
  function I() {}
  function x(e) {
    const { size: n, concurrency: t } = e,
      i = [];
    let o = 0;
    const r = () => {
      if (o < t && i.length) {
        const { producer: e, resolve: n, reject: t } = i.shift();
        o++,
          e().then(
            (e) => {
              o--, r(), n(e);
            },
            (e) => {
              o--, r(), t(e);
            }
          );
      }
    };
    return {
      add: (e) => {
        if (i.length + o >= n) throw new Error("Task buffer full");
        return new Promise((n, t) => {
          i.push({ producer: e, resolve: n, reject: t }), r();
        });
      },
    };
  }
  const O = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  function L(e = 10) {
    return Array.from(Array(e))
      .map(() => O[Math.floor(Math.random() * O.length)])
      .join("");
  }
  function N() {
    return Date.now();
  }
  class j {
    constructor(e, n) {
      var t, i;
      (this.signalBuffer = []),
        (this.itemLimit =
          null !== (t = null == n ? void 0 : n.itemLimit) && void 0 !== t
            ? t
            : 50),
        (this.sendTimeout =
          null !== (i = null == n ? void 0 : n.sendTimeout) && void 0 !== i
            ? i
            : 250),
        (this.paused = (null == n ? void 0 : n.paused) || !1),
        (this.sendFn = e),
        (this.flushInterval = -1),
        this.paused || this.start(),
        document.addEventListener("visibilitychange", () => {
          "hidden" === document.visibilityState && this.flush();
        });
    }
    addItem(e) {
      this.paused ||
        (this.signalBuffer.push(e),
        this.signalBuffer.length >= this.itemLimit && this.flush());
    }
    start() {
      (this.paused = !1),
        this.sendTimeout > 0 &&
          (this.flushInterval = window.setInterval(
            () => this.flush(),
            this.sendTimeout
          ));
    }
    pause() {
      (this.paused = !0), clearInterval(this.flushInterval);
    }
    groupItems(e) {
      const n = new Map();
      return (
        e.forEach((e) => {
          const t = JSON.stringify(e.meta);
          let i = n.get(t);
          (i = void 0 === i ? [e] : [...i, e]), n.set(t, i);
        }),
        Array.from(n.values())
      );
    }
    flush() {
      if (this.paused || 0 === this.signalBuffer.length) return;
      this.groupItems(this.signalBuffer).forEach(this.sendFn),
        (this.signalBuffer = []);
    }
  }
  var A;
  (e.TransportItemType = void 0),
    ((A = e.TransportItemType || (e.TransportItemType = {})).EXCEPTION =
      "exception"),
    (A.LOG = "log"),
    (A.MEASUREMENT = "measurement"),
    (A.TRACE = "trace"),
    (A.EVENT = "event");
  const C = {
    [e.TransportItemType.EXCEPTION]: "exceptions",
    [e.TransportItemType.LOG]: "logs",
    [e.TransportItemType.MEASUREMENT]: "measurements",
    [e.TransportItemType.TRACE]: "traces",
    [e.TransportItemType.EVENT]: "events",
  };
  function R(n) {
    return (t) => {
      if (t.type === e.TransportItemType.EXCEPTION && t.payload) {
        const e = t.payload,
          i = `${e.type}: ${e.value}`;
        if (
          (function (e, n) {
            return e.some((e) => (r(e) ? n.includes(e) : !!n.match(e)));
          })(n, i)
        )
          return null;
      }
      return t;
    };
  }
  function M(e, n, t, i) {
    var o;
    n.debug("Initializing transports");
    const r = [];
    let s = t.paused,
      a = [];
    const l = (e) => {
        let n = e;
        for (const e of a) {
          const t = n.map(e).filter(Boolean);
          if (0 === t.length) return [];
          n = t;
        }
        return n;
      },
      u = (e) => {
        const t = l(e);
        if (0 !== t.length)
          for (const e of r)
            n.debug(`Transporting item using ${e.name}\n`, t),
              e.isBatched() && e.send(t);
      };
    let c;
    (null === (o = t.batching) || void 0 === o ? void 0 : o.enabled) &&
      (c = new j(u, {
        sendTimeout: t.batching.sendTimeout,
        itemLimit: t.batching.itemLimit,
        paused: s,
      }));
    return {
      add: (...o) => {
        n.debug("Adding transports"),
          o.forEach((o) => {
            n.debug(`Adding "${o.name}" transport`);
            r.some((e) => e === o)
              ? n.warn(`Transport ${o.name} is already added`)
              : ((o.unpatchedConsole = e),
                (o.internalLogger = n),
                (o.config = t),
                (o.metas = i),
                r.push(o));
          });
      },
      addBeforeSendHooks: (...e) => {
        n.debug("Adding beforeSendHooks\n", a),
          e.forEach((e) => {
            e && a.push(e);
          });
      },
      addIgnoreErrorsPatterns: (...e) => {
        n.debug("Adding ignoreErrorsPatterns\n", e),
          e.forEach((e) => {
            e && a.push(R(e));
          });
      },
      getBeforeSendHooks: () => [...a],
      execute: (e) => {
        var i;
        s ||
          ((null === (i = t.batching) || void 0 === i ? void 0 : i.enabled) &&
            (null == c || c.addItem(e)),
          ((e) => {
            var i, o;
            if (
              (null === (i = t.batching) || void 0 === i
                ? void 0
                : i.enabled) &&
              r.every((e) => e.isBatched())
            )
              return;
            const [s] = l([e]);
            if (void 0 !== s)
              for (const e of r)
                n.debug(`Transporting item using ${e.name}\n`, s),
                  e.isBatched()
                    ? (null === (o = t.batching) || void 0 === o
                        ? void 0
                        : o.enabled) || e.send([s])
                    : e.send(s);
          })(e));
      },
      isPaused: () => s,
      pause: () => {
        n.debug("Pausing transports"), null == c || c.pause(), (s = !0);
      },
      remove: (...e) => {
        n.debug("Removing transports"),
          e.forEach((e) => {
            n.debug(`Removing "${e.name}" transport`);
            const t = r.indexOf(e);
            -1 !== t
              ? r.splice(t, 1)
              : n.warn(`Transport "${e.name}" is not added`);
          });
      },
      removeBeforeSendHooks: (...e) => {
        a.filter((n) => !e.includes(n));
      },
      get transports() {
        return [...r];
      },
      unpause: () => {
        n.debug("Unpausing transports"), null == c || c.start(), (s = !1);
      },
    };
  }
  var _;
  (e.InternalLoggerLevel = void 0),
    ((_ = e.InternalLoggerLevel || (e.InternalLoggerLevel = {}))[(_.OFF = 0)] =
      "OFF"),
    (_[(_.ERROR = 1)] = "ERROR"),
    (_[(_.WARN = 2)] = "WARN"),
    (_[(_.INFO = 3)] = "INFO"),
    (_[(_.VERBOSE = 4)] = "VERBOSE");
  const P = { debug: I, error: I, info: I, prefix: "Faro", warn: I },
    D = e.InternalLoggerLevel.ERROR,
    U = Object.assign({}, console);
  let B = U;
  function z(e) {
    var n;
    return (B = null !== (n = e.unpatchedConsole) && void 0 !== n ? n : B), B;
  }
  function F(n = U, t = D) {
    const i = P;
    return (
      t > e.InternalLoggerLevel.OFF &&
        ((i.error =
          t >= e.InternalLoggerLevel.ERROR
            ? function (...e) {
                n.error(`${i.prefix}\n`, ...e);
              }
            : I),
        (i.warn =
          t >= e.InternalLoggerLevel.WARN
            ? function (...e) {
                n.warn(`${i.prefix}\n`, ...e);
              }
            : I),
        (i.info =
          t >= e.InternalLoggerLevel.INFO
            ? function (...e) {
                n.info(`${i.prefix}\n`, ...e);
              }
            : I),
        (i.debug =
          t >= e.InternalLoggerLevel.VERBOSE
            ? function (...e) {
                n.debug(`${i.prefix}\n`, ...e);
              }
            : I)),
      i
    );
  }
  let V = P;
  function $(e, n) {
    return (V = F(e, n.internalLoggerLevel)), V;
  }
  class q {
    constructor() {
      (this.unpatchedConsole = U),
        (this.internalLogger = P),
        (this.config = {}),
        (this.metas = {});
    }
    logDebug(...e) {
      this.internalLogger.debug(`${this.name}\n`, ...e);
    }
    logInfo(...e) {
      this.internalLogger.info(`${this.name}\n`, ...e);
    }
    logWarn(...e) {
      this.internalLogger.warn(`${this.name}\n`, ...e);
    }
    logError(...e) {
      this.internalLogger.error(`${this.name}\n`, ...e);
    }
  }
  class G extends q {
    isBatched() {
      return !1;
    }
    getIgnoreUrls() {
      return [];
    }
  }
  function H(e, n) {
    var t, i;
    if (void 0 === n) return e;
    if (void 0 === e) return { resourceSpans: n };
    const o = null === (t = e.resourceSpans) || void 0 === t ? void 0 : t[0];
    if (void 0 === o) return e;
    const r = (null == o ? void 0 : o.scopeSpans) || [],
      s =
        (null === (i = null == n ? void 0 : n[0]) || void 0 === i
          ? void 0
          : i.scopeSpans) || [];
    return Object.assign(Object.assign({}, e), {
      resourceSpans: [
        Object.assign(Object.assign({}, o), { scopeSpans: [...r, ...s] }),
      ],
    });
  }
  function W(n) {
    let t = { meta: {} };
    return (
      void 0 !== n[0] && (t.meta = n[0].meta),
      n.forEach((n) => {
        switch (n.type) {
          case e.TransportItemType.LOG:
          case e.TransportItemType.EVENT:
          case e.TransportItemType.EXCEPTION:
          case e.TransportItemType.MEASUREMENT:
            const i = C[n.type],
              o = t[i];
            t = Object.assign(Object.assign({}, t), {
              [i]: void 0 === o ? [n.payload] : [...o, n.payload],
            });
            break;
          case e.TransportItemType.TRACE:
            t = Object.assign(Object.assign({}, t), {
              traces: H(t.traces, n.payload.resourceSpans),
            });
        }
      }),
      t
    );
  }
  const K = "Error";
  let J;
  function X(n, t, i, r, s) {
    t.debug("Initializing API");
    const a = (function (n, t, i, o, r) {
      let s;
      return (
        t.debug("Initializing traces API"),
        {
          getOTEL: () => s,
          getTraceContext: () => {
            const e =
              null == s ? void 0 : s.trace.getSpanContext(s.context.active());
            return e ? { trace_id: e.traceId, span_id: e.spanId } : void 0;
          },
          initOTEL: (e, n) => {
            t.debug("Initializing OpenTelemetry"),
              (s = { trace: e, context: n });
          },
          isOTELInitialized: () => !!s,
          pushTraces: (n) => {
            try {
              const i = {
                type: e.TransportItemType.TRACE,
                payload: n,
                meta: o.value,
              };
              t.debug("Pushing trace\n", i), r.execute(i);
            } catch (e) {
              t.error("Error pushing trace\n", e);
            }
          },
        }
      );
    })(0, t, 0, r, s);
    return Object.assign(
      Object.assign(
        Object.assign(
          Object.assign(
            Object.assign(
              Object.assign({}, a),
              (function (n, t, i, r, s, a) {
                var l;
                t.debug("Initializing exceptions API");
                let u = null;
                J = null !== (l = i.parseStacktrace) && void 0 !== l ? l : J;
                const c = (e) => {
                  t.debug("Changing stacktrace parser"),
                    (J = null != e ? e : J);
                };
                return (
                  c(i.parseStacktrace),
                  {
                    changeStacktraceParser: c,
                    getStacktraceParser: () => J,
                    pushError: (
                      n,
                      {
                        skipDedupe: l,
                        stackFrames: c,
                        type: d,
                        context: p,
                      } = {}
                    ) => {
                      d = d || n.name || K;
                      const f = {
                        meta: r.value,
                        payload: {
                          type: d,
                          value: n.message,
                          timestamp: S(),
                          trace: a.getTraceContext(),
                          context: null != p ? p : {},
                        },
                        type: e.TransportItemType.EXCEPTION,
                      };
                      (null ==
                      (c =
                        null != c
                          ? c
                          : n.stack
                          ? null == J
                            ? void 0
                            : J(n).frames
                          : void 0)
                        ? void 0
                        : c.length) && (f.payload.stacktrace = { frames: c });
                      const g = {
                        type: f.payload.type,
                        value: f.payload.value,
                        stackTrace: f.payload.stacktrace,
                        context: f.payload.context,
                      };
                      l || !i.dedupe || o(u) || !y(g, u)
                        ? ((u = g),
                          t.debug("Pushing exception\n", f),
                          s.execute(f))
                        : t.debug(
                            "Skipping error push because it is the same as the last one\n",
                            f.payload
                          );
                    },
                  }
                );
              })(0, t, i, r, s, a)
            ),
            (function (e, n, t, i, o) {
              let r, s, a;
              n.debug("Initializing meta API");
              const l = (e) => {
                  s && i.remove(s), (s = { user: e }), i.add(s);
                },
                u = (e) => {
                  r && i.remove(r), (r = { session: e }), i.add(r);
                };
              return {
                setUser: l,
                resetUser: l,
                setSession: u,
                resetSession: u,
                getSession: () => i.value.session,
                setView: (e) => {
                  var n;
                  if (
                    (null === (n = null == a ? void 0 : a.view) || void 0 === n
                      ? void 0
                      : n.name) === (null == e ? void 0 : e.name)
                  )
                    return;
                  const t = a;
                  (a = { view: e }), i.add(a), t && i.remove(t);
                },
                getView: () => i.value.view,
              };
            })(0, t, 0, r)
          ),
          (function (n, t, i, r, s, a) {
            t.debug("Initializing logs API");
            let l = null;
            return {
              pushLog: (n, { context: u, level: c, skipDedupe: d } = {}) => {
                try {
                  const p = {
                      type: e.TransportItemType.LOG,
                      payload: {
                        message: n
                          .map((e) => {
                            try {
                              return String(e);
                            } catch (e) {
                              return "";
                            }
                          })
                          .join(" "),
                        level: null != c ? c : T,
                        context: null != u ? u : {},
                        timestamp: S(),
                        trace: a.getTraceContext(),
                      },
                      meta: r.value,
                    },
                    f = {
                      message: p.payload.message,
                      level: p.payload.level,
                      context: p.payload.context,
                    };
                  if (!d && i.dedupe && !o(l) && y(f, l))
                    return void t.debug(
                      "Skipping log push because it is the same as the last one\n",
                      p.payload
                    );
                  (l = f), t.debug("Pushing log\n", p), s.execute(p);
                } catch (e) {
                  t.error("Error pushing log\n", e);
                }
              },
            };
          })(0, t, i, r, s, a)
        ),
        (function (n, t, i, r, s, a) {
          t.debug("Initializing measurements API");
          let l = null;
          return {
            pushMeasurement: (n, { skipDedupe: u, context: c } = {}) => {
              var d;
              try {
                const p = {
                    type: e.TransportItemType.MEASUREMENT,
                    payload: Object.assign(Object.assign({}, n), {
                      trace: a.getTraceContext(),
                      timestamp:
                        null !== (d = n.timestamp) && void 0 !== d ? d : S(),
                      context: null != c ? c : {},
                    }),
                    meta: r.value,
                  },
                  f = {
                    type: p.payload.type,
                    values: p.payload.values,
                    context: p.payload.context,
                  };
                if (!u && i.dedupe && !o(l) && y(f, l))
                  return void t.debug(
                    "Skipping measurement push because it is the same as the last one\n",
                    p.payload
                  );
                (l = f), t.debug("Pushing measurement\n", p), s.execute(p);
              } catch (e) {
                t.error("Error pushing measurement\n", e);
              }
            },
          };
        })(0, t, i, r, s, a)
      ),
      (function (n, t, i, r, s, a) {
        let l = null;
        return {
          pushEvent: (n, u, c, { skipDedupe: d } = {}) => {
            try {
              const p = {
                  meta: r.value,
                  payload: {
                    name: n,
                    domain: null != c ? c : i.eventDomain,
                    attributes: u,
                    timestamp: S(),
                    trace: a.getTraceContext(),
                  },
                  type: e.TransportItemType.EVENT,
                },
                f = {
                  name: p.payload.name,
                  attributes: p.payload.attributes,
                  domain: p.payload.domain,
                };
              if (!d && i.dedupe && !o(l) && y(f, l))
                return void t.debug(
                  "Skipping event push because it is the same as the last one\n",
                  p.payload
                );
              (l = f), t.debug("Pushing event\n", p), s.execute(p);
            } catch (e) {
              t.error("Error pushing event", e);
            }
          },
        };
      })(0, t, i, r, s, a)
    );
  }
  const Z =
    "undefined" != typeof globalThis
      ? globalThis
      : "undefined" != typeof global
      ? global
      : "undefined" != typeof self
      ? self
      : void 0;
  class Y extends q {
    constructor() {
      super(...arguments), (this.api = {}), (this.transports = {});
    }
  }
  const Q = "1.3.7";
  const ee = "_faroInternal";
  function ne(e) {
    e.config.isolate
      ? e.internalLogger.debug(
          "Skipping registering internal Faro instance on global object"
        )
      : (e.internalLogger.debug(
          "Registering internal Faro instance on global object"
        ),
        Object.defineProperty(Z, ee, {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: e,
        }));
  }
  function te() {
    return ee in Z;
  }
  function ie(n, t, i, o, r, s, a) {
    return (
      t.debug("Initializing Faro"),
      (e.faro = {
        api: s,
        config: i,
        instrumentations: a,
        internalLogger: t,
        metas: o,
        pause: r.pause,
        transports: r,
        unpatchedConsole: n,
        unpause: r.unpause,
      }),
      ne(e.faro),
      (function (e) {
        if (e.config.preventGlobalExposure)
          e.internalLogger.debug(
            "Skipping registering public Faro instance in the global scope"
          );
        else {
          if (
            (e.internalLogger.debug(
              `Registering public faro reference in the global scope using "${e.config.globalObjectKey}" key`
            ),
            e.config.globalObjectKey in Z)
          )
            return void e.internalLogger.warn(
              `Skipping global registration due to key "${e.config.globalObjectKey}" being used already. Please set "globalObjectKey" to something else or set "preventGlobalExposure" to "true"`
            );
          Object.defineProperty(Z, e.config.globalObjectKey, {
            configurable: !1,
            writable: !1,
            value: e,
          });
        }
      })(e.faro),
      e.faro
    );
  }
  function oe(e) {
    const n = z(e),
      t = $(n, e);
    if (te() && !e.isolate)
      return void t.error(
        'Faro is already registered. Either add instrumentations, transports etc. to the global faro instance or use the "isolate" property'
      );
    t.debug("Initializing");
    const i = (function (e, n, t) {
        let i = [],
          o = [];
        const r = () =>
            i.reduce((e, n) => Object.assign(e, l(n) ? n() : n), {}),
          s = () => {
            if (o.length) {
              const e = r();
              o.forEach((n) => n(e));
            }
          };
        return {
          add: (...e) => {
            n.debug("Adding metas\n", e), i.push(...e), s();
          },
          remove: (...e) => {
            n.debug("Removing metas\n", e),
              (i = i.filter((n) => !e.includes(n))),
              s();
          },
          addListener: (e) => {
            n.debug("Adding metas listener\n", e), o.push(e);
          },
          removeListener: (e) => {
            n.debug("Removing metas listener\n", e),
              (o = o.filter((n) => n !== e));
          },
          get value() {
            return r();
          },
        };
      })(0, t),
      o = M(n, t, e, i),
      r = X(0, t, e, i, o),
      s = (function (e, n, t, i, o, r) {
        n.debug("Initializing instrumentations");
        const s = [];
        return {
          add: (...a) => {
            n.debug("Adding instrumentations"),
              a.forEach((a) => {
                n.debug(`Adding "${a.name}" instrumentation`),
                  s.some((e) => e.name === a.name)
                    ? n.warn(`Instrumentation ${a.name} is already added`)
                    : ((a.unpatchedConsole = e),
                      (a.internalLogger = n),
                      (a.config = t),
                      (a.metas = i),
                      (a.transports = o),
                      (a.api = r),
                      s.push(a),
                      a.initialize());
              });
          },
          get instrumentations() {
            return [...s];
          },
          remove: (...e) => {
            n.debug("Removing instrumentations"),
              e.forEach((e) => {
                var t, i;
                n.debug(`Removing "${e.name}" instrumentation`);
                const o = s.reduce(
                  (n, t, i) => (null === n && t.name === e.name ? i : null),
                  null
                );
                o
                  ? (null === (i = (t = s[o]).destroy) ||
                      void 0 === i ||
                      i.call(t),
                    s.splice(o, 1))
                  : n.warn(`Instrumentation "${e.name}" is not added`);
              });
          },
        };
      })(n, t, e, i, o, r),
      a = ie(n, t, e, i, o, r, s);
    return (
      (function (e) {
        var n, t;
        const i = { sdk: { version: Q } },
          o =
            null === (n = e.config.sessionTracking) || void 0 === n
              ? void 0
              : n.session;
        o && e.api.setSession(o),
          e.config.app && (i.app = e.config.app),
          e.config.user && (i.user = e.config.user),
          e.config.view && (i.view = e.config.view),
          e.metas.add(
            i,
            ...(null !== (t = e.config.metas) && void 0 !== t ? t : [])
          );
      })(a),
      (function (e) {
        e.transports.add(...e.config.transports),
          e.transports.addBeforeSendHooks(e.config.beforeSend),
          e.transports.addIgnoreErrorsPatterns(e.config.ignoreErrors);
      })(a),
      (function (e) {
        e.instrumentations.add(...e.config.instrumentations);
      })(a),
      a
    );
  }
  e.faro = {};
  const re = "faro",
    se = { enabled: !0, sendTimeout: 250, itemLimit: 50 },
    ae = "view_changed",
    le = "session_start",
    ue = "session_resume",
    ce = "session_extend";
  var de =
      "undefined" != typeof globalThis
        ? globalThis
        : "undefined" != typeof window
        ? window
        : "undefined" != typeof global
        ? global
        : "undefined" != typeof self
        ? self
        : {},
    pe = { exports: {} };
  !(function (e, n) {
    !(function (t, i) {
      var o = "function",
        r = "undefined",
        s = "object",
        a = "string",
        l = "major",
        u = "model",
        c = "name",
        d = "type",
        p = "vendor",
        f = "version",
        g = "architecture",
        m = "console",
        v = "mobile",
        b = "tablet",
        h = "smarttv",
        w = "wearable",
        y = "embedded",
        S = "Amazon",
        E = "Apple",
        T = "ASUS",
        k = "BlackBerry",
        I = "Browser",
        x = "Chrome",
        O = "Firefox",
        L = "Google",
        N = "Huawei",
        j = "LG",
        A = "Microsoft",
        C = "Motorola",
        R = "Opera",
        M = "Samsung",
        _ = "Sharp",
        P = "Sony",
        D = "Xiaomi",
        U = "Zebra",
        B = "Facebook",
        z = "Chromium OS",
        F = "Mac OS",
        V = function (e) {
          for (var n = {}, t = 0; t < e.length; t++)
            n[e[t].toUpperCase()] = e[t];
          return n;
        },
        $ = function (e, n) {
          return typeof e === a && -1 !== q(n).indexOf(q(e));
        },
        q = function (e) {
          return e.toLowerCase();
        },
        G = function (e, n) {
          if (typeof e === a)
            return (
              (e = e.replace(/^\s\s*/, "")),
              typeof n === r ? e : e.substring(0, 350)
            );
        },
        H = function (e, n) {
          for (var t, r, a, l, u, c, d = 0; d < n.length && !u; ) {
            var p = n[d],
              f = n[d + 1];
            for (t = r = 0; t < p.length && !u && p[t]; )
              if ((u = p[t++].exec(e)))
                for (a = 0; a < f.length; a++)
                  (c = u[++r]),
                    typeof (l = f[a]) === s && l.length > 0
                      ? 2 === l.length
                        ? typeof l[1] == o
                          ? (this[l[0]] = l[1].call(this, c))
                          : (this[l[0]] = l[1])
                        : 3 === l.length
                        ? typeof l[1] !== o || (l[1].exec && l[1].test)
                          ? (this[l[0]] = c ? c.replace(l[1], l[2]) : i)
                          : (this[l[0]] = c ? l[1].call(this, c, l[2]) : i)
                        : 4 === l.length &&
                          (this[l[0]] = c
                            ? l[3].call(this, c.replace(l[1], l[2]))
                            : i)
                      : (this[l] = c || i);
            d += 2;
          }
        },
        W = function (e, n) {
          for (var t in n)
            if (typeof n[t] === s && n[t].length > 0) {
              for (var o = 0; o < n[t].length; o++)
                if ($(n[t][o], e)) return "?" === t ? i : t;
            } else if ($(n[t], e)) return "?" === t ? i : t;
          return e;
        },
        K = {
          ME: "4.90",
          "NT 3.11": "NT3.51",
          "NT 4.0": "NT4.0",
          2e3: "NT 5.0",
          XP: ["NT 5.1", "NT 5.2"],
          Vista: "NT 6.0",
          7: "NT 6.1",
          8: "NT 6.2",
          8.1: "NT 6.3",
          10: ["NT 6.4", "NT 10.0"],
          RT: "ARM",
        },
        J = {
          browser: [
            [/\b(?:crmo|crios)\/([\w\.]+)/i],
            [f, [c, "Chrome"]],
            [/edg(?:e|ios|a)?\/([\w\.]+)/i],
            [f, [c, "Edge"]],
            [
              /(opera mini)\/([-\w\.]+)/i,
              /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,
              /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i,
            ],
            [c, f],
            [/opios[\/ ]+([\w\.]+)/i],
            [f, [c, R + " Mini"]],
            [/\bopr\/([\w\.]+)/i],
            [f, [c, R]],
            [
              /(kindle)\/([\w\.]+)/i,
              /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i,
              /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i,
              /(ba?idubrowser)[\/ ]?([\w\.]+)/i,
              /(?:ms|\()(ie) ([\w\.]+)/i,
              /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i,
              /(heytap|ovi)browser\/([\d\.]+)/i,
              /(weibo)__([\d\.]+)/i,
            ],
            [c, f],
            [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i],
            [f, [c, "UC" + I]],
            [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i],
            [f, [c, "WeChat(Win) Desktop"]],
            [/micromessenger\/([\w\.]+)/i],
            [f, [c, "WeChat"]],
            [/konqueror\/([\w\.]+)/i],
            [f, [c, "Konqueror"]],
            [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i],
            [f, [c, "IE"]],
            [/ya(?:search)?browser\/([\w\.]+)/i],
            [f, [c, "Yandex"]],
            [/(avast|avg)\/([\w\.]+)/i],
            [[c, /(.+)/, "$1 Secure " + I], f],
            [/\bfocus\/([\w\.]+)/i],
            [f, [c, O + " Focus"]],
            [/\bopt\/([\w\.]+)/i],
            [f, [c, R + " Touch"]],
            [/coc_coc\w+\/([\w\.]+)/i],
            [f, [c, "Coc Coc"]],
            [/dolfin\/([\w\.]+)/i],
            [f, [c, "Dolphin"]],
            [/coast\/([\w\.]+)/i],
            [f, [c, R + " Coast"]],
            [/miuibrowser\/([\w\.]+)/i],
            [f, [c, "MIUI " + I]],
            [/fxios\/([-\w\.]+)/i],
            [f, [c, O]],
            [/\bqihu|(qi?ho?o?|360)browser/i],
            [[c, "360 " + I]],
            [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i],
            [[c, /(.+)/, "$1 " + I], f],
            [/(comodo_dragon)\/([\w\.]+)/i],
            [[c, /_/g, " "], f],
            [
              /(electron)\/([\w\.]+) safari/i,
              /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,
              /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i,
            ],
            [c, f],
            [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i],
            [c],
            [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i],
            [[c, B], f],
            [
              /(kakao(?:talk|story))[\/ ]([\w\.]+)/i,
              /(naver)\(.*?(\d+\.[\w\.]+).*\)/i,
              /safari (line)\/([\w\.]+)/i,
              /\b(line)\/([\w\.]+)\/iab/i,
              /(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i,
            ],
            [c, f],
            [/\bgsa\/([\w\.]+) .*safari\//i],
            [f, [c, "GSA"]],
            [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i],
            [f, [c, "TikTok"]],
            [/headlesschrome(?:\/([\w\.]+)| )/i],
            [f, [c, x + " Headless"]],
            [/ wv\).+(chrome)\/([\w\.]+)/i],
            [[c, x + " WebView"], f],
            [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i],
            [f, [c, "Android " + I]],
            [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i],
            [c, f],
            [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i],
            [f, [c, "Mobile Safari"]],
            [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i],
            [f, c],
            [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i],
            [
              c,
              [
                f,
                W,
                {
                  "1.0": "/8",
                  1.2: "/1",
                  1.3: "/3",
                  "2.0": "/412",
                  "2.0.2": "/416",
                  "2.0.3": "/417",
                  "2.0.4": "/419",
                  "?": "/",
                },
              ],
            ],
            [/(webkit|khtml)\/([\w\.]+)/i],
            [c, f],
            [/(navigator|netscape\d?)\/([-\w\.]+)/i],
            [[c, "Netscape"], f],
            [/mobile vr; rv:([\w\.]+)\).+firefox/i],
            [f, [c, O + " Reality"]],
            [
              /ekiohf.+(flow)\/([\w\.]+)/i,
              /(swiftfox)/i,
              /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i,
              /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
              /(firefox)\/([\w\.]+)/i,
              /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,
              /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
              /(links) \(([\w\.]+)/i,
              /panasonic;(viera)/i,
            ],
            [c, f],
            [/(cobalt)\/([\w\.]+)/i],
            [c, [f, /master.|lts./, ""]],
          ],
          cpu: [
            [/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i],
            [[g, "amd64"]],
            [/(ia32(?=;))/i],
            [[g, q]],
            [/((?:i[346]|x)86)[;\)]/i],
            [[g, "ia32"]],
            [/\b(aarch64|arm(v?8e?l?|_?64))\b/i],
            [[g, "arm64"]],
            [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i],
            [[g, "armhf"]],
            [/windows (ce|mobile); ppc;/i],
            [[g, "arm"]],
            [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i],
            [[g, /ower/, "", q]],
            [/(sun4\w)[;\)]/i],
            [[g, "sparc"]],
            [
              /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i,
            ],
            [[g, q]],
          ],
          device: [
            [
              /\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i,
            ],
            [u, [p, M], [d, b]],
            [
              /\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
              /samsung[- ]([-\w]+)/i,
              /sec-(sgh\w+)/i,
            ],
            [u, [p, M], [d, v]],
            [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i],
            [u, [p, E], [d, v]],
            [
              /\((ipad);[-\w\),; ]+apple/i,
              /applecoremedia\/[\w\.]+ \((ipad)/i,
              /\b(ipad)\d\d?,\d\d?[;\]].+ios/i,
            ],
            [u, [p, E], [d, b]],
            [/(macintosh);/i],
            [u, [p, E]],
            [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i],
            [u, [p, _], [d, v]],
            [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i],
            [u, [p, N], [d, b]],
            [
              /(?:huawei|honor)([-\w ]+)[;\)]/i,
              /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i,
            ],
            [u, [p, N], [d, v]],
            [
              /\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,
              /\b; (\w+) build\/hm\1/i,
              /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,
              /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,
              /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i,
            ],
            [
              [u, /_/g, " "],
              [p, D],
              [d, v],
            ],
            [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i],
            [
              [u, /_/g, " "],
              [p, D],
              [d, b],
            ],
            [
              /; (\w+) bui.+ oppo/i,
              /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i,
            ],
            [u, [p, "OPPO"], [d, v]],
            [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i],
            [u, [p, "Vivo"], [d, v]],
            [/\b(rmx[12]\d{3})(?: bui|;|\))/i],
            [u, [p, "Realme"], [d, v]],
            [
              /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
              /\bmot(?:orola)?[- ](\w*)/i,
              /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i,
            ],
            [u, [p, C], [d, v]],
            [/\b(mz60\d|xoom[2 ]{0,2}) build\//i],
            [u, [p, C], [d, b]],
            [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i],
            [u, [p, j], [d, b]],
            [
              /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
              /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
              /\blg-?([\d\w]+) bui/i,
            ],
            [u, [p, j], [d, v]],
            [
              /(ideatab[-\w ]+)/i,
              /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i,
            ],
            [u, [p, "Lenovo"], [d, b]],
            [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i],
            [
              [u, /_/g, " "],
              [p, "Nokia"],
              [d, v],
            ],
            [/(pixel c)\b/i],
            [u, [p, L], [d, b]],
            [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i],
            [u, [p, L], [d, v]],
            [
              /droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i,
            ],
            [u, [p, P], [d, v]],
            [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i],
            [
              [u, "Xperia Tablet"],
              [p, P],
              [d, b],
            ],
            [
              / (kb2005|in20[12]5|be20[12][59])\b/i,
              /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i,
            ],
            [u, [p, "OnePlus"], [d, v]],
            [
              /(alexa)webm/i,
              /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i,
              /(kf[a-z]+)( bui|\)).+silk\//i,
            ],
            [u, [p, S], [d, b]],
            [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i],
            [
              [u, /(.+)/g, "Fire Phone $1"],
              [p, S],
              [d, v],
            ],
            [/(playbook);[-\w\),; ]+(rim)/i],
            [u, p, [d, b]],
            [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i],
            [u, [p, k], [d, v]],
            [
              /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i,
            ],
            [u, [p, T], [d, b]],
            [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],
            [u, [p, T], [d, v]],
            [/(nexus 9)/i],
            [u, [p, "HTC"], [d, b]],
            [
              /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,
              /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
              /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i,
            ],
            [p, [u, /_/g, " "], [d, v]],
            [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i],
            [u, [p, "Acer"], [d, b]],
            [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i],
            [u, [p, "Meizu"], [d, v]],
            [
              /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno)[-_ ]?([-\w]*)/i,
              /(hp) ([\w ]+\w)/i,
              /(asus)-?(\w+)/i,
              /(microsoft); (lumia[\w ]+)/i,
              /(lenovo)[-_ ]?([-\w]+)/i,
              /(jolla)/i,
              /(oppo) ?([\w ]+) bui/i,
            ],
            [p, u, [d, v]],
            [
              /(kobo)\s(ereader|touch)/i,
              /(archos) (gamepad2?)/i,
              /(hp).+(touchpad(?!.+tablet)|tablet)/i,
              /(kindle)\/([\w\.]+)/i,
              /(nook)[\w ]+build\/(\w+)/i,
              /(dell) (strea[kpr\d ]*[\dko])/i,
              /(le[- ]+pan)[- ]+(\w{1,9}) bui/i,
              /(trinity)[- ]*(t\d{3}) bui/i,
              /(gigaset)[- ]+(q\w{1,9}) bui/i,
              /(vodafone) ([\w ]+)(?:\)| bui)/i,
            ],
            [p, u, [d, b]],
            [/(surface duo)/i],
            [u, [p, A], [d, b]],
            [/droid [\d\.]+; (fp\du?)(?: b|\))/i],
            [u, [p, "Fairphone"], [d, v]],
            [/(u304aa)/i],
            [u, [p, "AT&T"], [d, v]],
            [/\bsie-(\w*)/i],
            [u, [p, "Siemens"], [d, v]],
            [/\b(rct\w+) b/i],
            [u, [p, "RCA"], [d, b]],
            [/\b(venue[\d ]{2,7}) b/i],
            [u, [p, "Dell"], [d, b]],
            [/\b(q(?:mv|ta)\w+) b/i],
            [u, [p, "Verizon"], [d, b]],
            [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i],
            [u, [p, "Barnes & Noble"], [d, b]],
            [/\b(tm\d{3}\w+) b/i],
            [u, [p, "NuVision"], [d, b]],
            [/\b(k88) b/i],
            [u, [p, "ZTE"], [d, b]],
            [/\b(nx\d{3}j) b/i],
            [u, [p, "ZTE"], [d, v]],
            [/\b(gen\d{3}) b.+49h/i],
            [u, [p, "Swiss"], [d, v]],
            [/\b(zur\d{3}) b/i],
            [u, [p, "Swiss"], [d, b]],
            [/\b((zeki)?tb.*\b) b/i],
            [u, [p, "Zeki"], [d, b]],
            [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i],
            [[p, "Dragon Touch"], u, [d, b]],
            [/\b(ns-?\w{0,9}) b/i],
            [u, [p, "Insignia"], [d, b]],
            [/\b((nxa|next)-?\w{0,9}) b/i],
            [u, [p, "NextBook"], [d, b]],
            [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i],
            [[p, "Voice"], u, [d, v]],
            [/\b(lvtel\-)?(v1[12]) b/i],
            [[p, "LvTel"], u, [d, v]],
            [/\b(ph-1) /i],
            [u, [p, "Essential"], [d, v]],
            [/\b(v(100md|700na|7011|917g).*\b) b/i],
            [u, [p, "Envizen"], [d, b]],
            [/\b(trio[-\w\. ]+) b/i],
            [u, [p, "MachSpeed"], [d, b]],
            [/\btu_(1491) b/i],
            [u, [p, "Rotor"], [d, b]],
            [/(shield[\w ]+) b/i],
            [u, [p, "Nvidia"], [d, b]],
            [/(sprint) (\w+)/i],
            [p, u, [d, v]],
            [/(kin\.[onetw]{3})/i],
            [
              [u, /\./g, " "],
              [p, A],
              [d, v],
            ],
            [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],
            [u, [p, U], [d, b]],
            [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],
            [u, [p, U], [d, v]],
            [/smart-tv.+(samsung)/i],
            [p, [d, h]],
            [/hbbtv.+maple;(\d+)/i],
            [
              [u, /^/, "SmartTV"],
              [p, M],
              [d, h],
            ],
            [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i],
            [
              [p, j],
              [d, h],
            ],
            [/(apple) ?tv/i],
            [p, [u, E + " TV"], [d, h]],
            [/crkey/i],
            [
              [u, x + "cast"],
              [p, L],
              [d, h],
            ],
            [/droid.+aft(\w+)( bui|\))/i],
            [u, [p, S], [d, h]],
            [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i],
            [u, [p, _], [d, h]],
            [/(bravia[\w ]+)( bui|\))/i],
            [u, [p, P], [d, h]],
            [/(mitv-\w{5}) bui/i],
            [u, [p, D], [d, h]],
            [/Hbbtv.*(technisat) (.*);/i],
            [p, u, [d, h]],
            [
              /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,
              /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i,
            ],
            [
              [p, G],
              [u, G],
              [d, h],
            ],
            [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i],
            [[d, h]],
            [/(ouya)/i, /(nintendo) ([wids3utch]+)/i],
            [p, u, [d, m]],
            [/droid.+; (shield) bui/i],
            [u, [p, "Nvidia"], [d, m]],
            [/(playstation [345portablevi]+)/i],
            [u, [p, P], [d, m]],
            [/\b(xbox(?: one)?(?!; xbox))[\); ]/i],
            [u, [p, A], [d, m]],
            [/((pebble))app/i],
            [p, u, [d, w]],
            [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i],
            [u, [p, E], [d, w]],
            [/droid.+; (glass) \d/i],
            [u, [p, L], [d, w]],
            [/droid.+; (wt63?0{2,3})\)/i],
            [u, [p, U], [d, w]],
            [/(quest( 2| pro)?)/i],
            [u, [p, B], [d, w]],
            [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i],
            [p, [d, y]],
            [/(aeobc)\b/i],
            [u, [p, S], [d, y]],
            [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i],
            [u, [d, v]],
            [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i],
            [u, [d, b]],
            [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i],
            [[d, b]],
            [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i],
            [[d, v]],
            [/(android[-\w\. ]{0,9});.+buil/i],
            [u, [p, "Generic"]],
          ],
          engine: [
            [/windows.+ edge\/([\w\.]+)/i],
            [f, [c, "EdgeHTML"]],
            [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],
            [f, [c, "Blink"]],
            [
              /(presto)\/([\w\.]+)/i,
              /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,
              /ekioh(flow)\/([\w\.]+)/i,
              /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,
              /(icab)[\/ ]([23]\.[\d\.]+)/i,
              /\b(libweb)/i,
            ],
            [c, f],
            [/rv\:([\w\.]{1,9})\b.+(gecko)/i],
            [f, c],
          ],
          os: [
            [/microsoft (windows) (vista|xp)/i],
            [c, f],
            [
              /(windows) nt 6\.2; (arm)/i,
              /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i,
              /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i,
            ],
            [c, [f, W, K]],
            [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i],
            [
              [c, "Windows"],
              [f, W, K],
            ],
            [
              /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,
              /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
              /cfnetwork\/.+darwin/i,
            ],
            [
              [f, /_/g, "."],
              [c, "iOS"],
            ],
            [
              /(mac os x) ?([\w\. ]*)/i,
              /(macintosh|mac_powerpc\b)(?!.+haiku)/i,
            ],
            [
              [c, F],
              [f, /_/g, "."],
            ],
            [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i],
            [f, c],
            [
              /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
              /(blackberry)\w*\/([\w\.]*)/i,
              /(tizen|kaios)[\/ ]([\w\.]+)/i,
              /\((series40);/i,
            ],
            [c, f],
            [/\(bb(10);/i],
            [f, [c, k]],
            [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i],
            [f, [c, "Symbian"]],
            [
              /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i,
            ],
            [f, [c, O + " OS"]],
            [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i],
            [f, [c, "webOS"]],
            [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i],
            [f, [c, "watchOS"]],
            [/crkey\/([\d\.]+)/i],
            [f, [c, x + "cast"]],
            [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i],
            [[c, z], f],
            [
              /panasonic;(viera)/i,
              /(netrange)mmh/i,
              /(nettv)\/(\d+\.[\w\.]+)/i,
              /(nintendo|playstation) ([wids345portablevuch]+)/i,
              /(xbox); +xbox ([^\);]+)/i,
              /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,
              /(mint)[\/\(\) ]?(\w*)/i,
              /(mageia|vectorlinux)[; ]/i,
              /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
              /(hurd|linux) ?([\w\.]*)/i,
              /(gnu) ?([\w\.]*)/i,
              /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,
              /(haiku) (\w+)/i,
            ],
            [c, f],
            [/(sunos) ?([\w\.\d]*)/i],
            [[c, "Solaris"], f],
            [
              /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,
              /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,
              /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,
              /(unix) ?([\w\.]*)/i,
            ],
            [c, f],
          ],
        },
        X = function (e, n) {
          if ((typeof e === s && ((n = e), (e = i)), !(this instanceof X)))
            return new X(e, n).getResult();
          var m = typeof t !== r && t.navigator ? t.navigator : i,
            h = e || (m && m.userAgent ? m.userAgent : ""),
            w = m && m.userAgentData ? m.userAgentData : i,
            y = n
              ? (function (e, n) {
                  var t = {};
                  for (var i in e)
                    n[i] && n[i].length % 2 == 0
                      ? (t[i] = n[i].concat(e[i]))
                      : (t[i] = e[i]);
                  return t;
                })(J, n)
              : J,
            S = m && m.userAgent == h;
          return (
            (this.getBrowser = function () {
              var e,
                n = {};
              return (
                (n[c] = i),
                (n[f] = i),
                H.call(n, h, y.browser),
                (n[l] =
                  typeof (e = n[f]) === a
                    ? e.replace(/[^\d\.]/g, "").split(".")[0]
                    : i),
                S &&
                  m &&
                  m.brave &&
                  typeof m.brave.isBrave == o &&
                  (n[c] = "Brave"),
                n
              );
            }),
            (this.getCPU = function () {
              var e = {};
              return (e[g] = i), H.call(e, h, y.cpu), e;
            }),
            (this.getDevice = function () {
              var e = {};
              return (
                (e[p] = i),
                (e[u] = i),
                (e[d] = i),
                H.call(e, h, y.device),
                S && !e[d] && w && w.mobile && (e[d] = v),
                S &&
                  "Macintosh" == e[u] &&
                  m &&
                  typeof m.standalone !== r &&
                  m.maxTouchPoints &&
                  m.maxTouchPoints > 2 &&
                  ((e[u] = "iPad"), (e[d] = b)),
                e
              );
            }),
            (this.getEngine = function () {
              var e = {};
              return (e[c] = i), (e[f] = i), H.call(e, h, y.engine), e;
            }),
            (this.getOS = function () {
              var e = {};
              return (
                (e[c] = i),
                (e[f] = i),
                H.call(e, h, y.os),
                S &&
                  !e[c] &&
                  w &&
                  "Unknown" != w.platform &&
                  (e[c] = w.platform
                    .replace(/chrome os/i, z)
                    .replace(/macos/i, F)),
                e
              );
            }),
            (this.getResult = function () {
              return {
                ua: this.getUA(),
                browser: this.getBrowser(),
                engine: this.getEngine(),
                os: this.getOS(),
                device: this.getDevice(),
                cpu: this.getCPU(),
              };
            }),
            (this.getUA = function () {
              return h;
            }),
            (this.setUA = function (e) {
              return (
                (h = typeof e === a && e.length > 350 ? G(e, 350) : e), this
              );
            }),
            this.setUA(h),
            this
          );
        };
      (X.VERSION = "1.0.36"),
        (X.BROWSER = V([c, f, l])),
        (X.CPU = V([g])),
        (X.DEVICE = V([u, p, d, m, v, h, b, w, y])),
        (X.ENGINE = X.OS = V([c, f])),
        e.exports && (n = e.exports = X),
        (n.UAParser = X);
      var Z = typeof t !== r && (t.jQuery || t.Zepto);
      if (Z && !Z.ua) {
        var Y = new X();
        (Z.ua = Y.getResult()),
          (Z.ua.get = function () {
            return Y.getUA();
          }),
          (Z.ua.set = function (e) {
            Y.setUA(e);
            var n = Y.getResult();
            for (var t in n) Z.ua[t] = n[t];
          });
      }
    })("object" == typeof window ? window : de);
  })(pe, pe.exports);
  var fe = pe.exports;
  const ge = () => {
      const e = new fe.UAParser(),
        { name: n, version: t } = e.getBrowser(),
        { name: i, version: o } = e.getOS(),
        r = e.getUA(),
        s = navigator.language,
        a = navigator.userAgent.includes("Mobi"),
        l = (function () {
          if (!n || !t) return;
          if ("userAgentData" in navigator)
            return navigator.userAgentData.brands;
          return;
        })(),
        u = "unknown";
      return {
        browser: {
          name: null != n ? n : u,
          version: null != t ? t : u,
          os: `${null != i ? i : u} ${null != o ? o : u}`,
          userAgent: null != r ? r : u,
          language: null != s ? s : u,
          mobile: a,
          brands: null != l ? l : u,
        },
      };
    },
    me = () => ({ page: { url: location.href } }),
    ve = [ge, me];
  function be(n) {
    var t, i, o, r;
    return {
      id:
        null !==
          (r =
            null ===
              (o =
                null ===
                  (i =
                    null === (t = e.faro.config) || void 0 === t
                      ? void 0
                      : t.sessionTracking) || void 0 === i
                  ? void 0
                  : i.generateSessionId) || void 0 === o
              ? void 0
              : o.call(i)) && void 0 !== r
          ? r
          : L(),
      attributes: n,
    };
  }
  const he = { name: "default" },
    we = "sessionStorage",
    ye = "localStorage";
  function Se(n) {
    var t;
    try {
      let e;
      e = window[n];
      const t = "__faro_storage_test__";
      return e.setItem(t, t), e.removeItem(t), !0;
    } catch (i) {
      return (
        null === (t = e.faro.internalLogger) ||
          void 0 === t ||
          t.info(`Web storage of type ${n} is not available. Reason: ${i}`),
        !1
      );
    }
  }
  function Ee(e, n) {
    return Oe(n) ? window[n].getItem(e) : null;
  }
  function Te(e, n, t) {
    if (Oe(t))
      try {
        window[t].setItem(e, n);
      } catch (e) {}
  }
  function ke(e, n) {
    Oe(n) && window[n].removeItem(e);
  }
  const Ie = Se(ye),
    xe = Se(we);
  function Oe(e) {
    return e === ye ? Ie : e === we && xe;
  }
  function Le(e, n) {
    let t,
      i = !1;
    const o = () => {
      null != t ? (e(...t), (t = null), setTimeout(o, n)) : (i = !1);
    };
    return (...r) => {
      i ? (t = r) : (e(...r), (i = !0), setTimeout(o, n));
    };
  }
  function Ne() {
    var n, t, i;
    const o = e.faro.config.sessionTracking;
    let r =
      null !==
        (i =
          null !==
            (t =
              null === (n = null == o ? void 0 : o.sampler) || void 0 === n
                ? void 0
                : n.call(o, { metas: e.faro.metas.value })) && void 0 !== t
            ? t
            : null == o
            ? void 0
            : o.samplingRate) && void 0 !== i
        ? i
        : 1;
    if ("number" != typeof r) {
      r = 0;
    }
    return Math.random() < r;
  }
  const je = "com.grafana.faro.session",
    Ae = 144e5,
    Ce = 9e5,
    Re = 96e4,
    Me = { enabled: !0, persistent: !1, maxSessionPersistenceTime: Re };
  function _e({ sessionId: n, isSampled: t = !0 } = {}) {
    var i, o;
    const r = N(),
      s =
        null ===
          (o =
            null === (i = e.faro.config) || void 0 === i
              ? void 0
              : i.sessionTracking) || void 0 === o
          ? void 0
          : o.generateSessionId;
    return (
      null == n && (n = "function" == typeof s ? s() : L()),
      { sessionId: n, lastActivity: r, started: r, isSampled: t }
    );
  }
  function Pe(e) {
    if (null == e) return !1;
    const n = N();
    if (!(n - e.started < Ae)) return !1;
    return n - e.lastActivity < Ce;
  }
  function De({ fetchUserSession: n, storeUserSession: t }) {
    return function () {
      var i, o, r, s;
      if (!n || !t) return;
      const a = n();
      if (Pe(a)) t(Object.assign(Object.assign({}, a), { lastActivity: N() }));
      else {
        let n = Ue(_e({ isSampled: Ne() }), a);
        t(n),
          null === (i = e.faro.api) ||
            void 0 === i ||
            i.setSession(n.sessionMeta),
          null ===
            (r =
              null === (o = e.faro.config.sessionTracking) || void 0 === o
                ? void 0
                : o.onSessionChange) ||
            void 0 === r ||
            r.call(
              o,
              null !== (s = null == a ? void 0 : a.sessionMeta) && void 0 !== s
                ? s
                : null,
              n.sessionMeta
            );
      }
    };
  }
  function Ue(n, t) {
    var i, o, r, s;
    return Object.assign(Object.assign({}, n), {
      sessionMeta: {
        id: n.sessionId,
        attributes: Object.assign(
          Object.assign(
            Object.assign(
              Object.assign(
                {},
                null ===
                  (o =
                    null === (i = e.faro.config.sessionTracking) || void 0 === i
                      ? void 0
                      : i.session) || void 0 === o
                  ? void 0
                  : o.attributes
              ),
              null !==
                (s =
                  null === (r = e.faro.metas.value.session) || void 0 === r
                    ? void 0
                    : r.attributes) && void 0 !== s
                ? s
                : {}
            ),
            null != t ? { previousSession: t.sessionId } : {}
          ),
          { isSampled: n.isSampled.toString() }
        ),
      },
    });
  }
  class Be {
    constructor() {
      (this.updateSession = Le(() => this.updateUserSession(), 1e3)),
        (this.updateUserSession = De({
          fetchUserSession: Be.fetchUserSession,
          storeUserSession: Be.storeUserSession,
        })),
        this.init();
    }
    static removeUserSession() {
      ke(je, Be.storageTypeLocal);
    }
    static storeUserSession(e) {
      Te(je, JSON.stringify(e), Be.storageTypeLocal);
    }
    static fetchUserSession() {
      const e = Ee(je, Be.storageTypeLocal);
      return e ? JSON.parse(e) : null;
    }
    init() {
      document.addEventListener("visibilitychange", () => {
        "visible" === document.visibilityState && this.updateSession();
      }),
        e.faro.metas.addListener(function (n) {
          const t = n.session,
            i = Be.fetchUserSession();
          if (t && t.id !== (null == i ? void 0 : i.sessionId)) {
            const n = Ue(_e({ sessionId: t.id, isSampled: Ne() }), i);
            Be.storeUserSession(n), e.faro.api.setSession(n.sessionMeta);
          }
        });
    }
  }
  Be.storageTypeLocal = ye;
  class ze {
    constructor() {
      (this.updateSession = Le(() => this.updateUserSession(), 1e3)),
        (this.updateUserSession = De({
          fetchUserSession: ze.fetchUserSession,
          storeUserSession: ze.storeUserSession,
        })),
        this.init();
    }
    static removeUserSession() {
      ke(je, ze.storageTypeSession);
    }
    static storeUserSession(e) {
      Te(je, JSON.stringify(e), ze.storageTypeSession);
    }
    static fetchUserSession() {
      const e = Ee(je, ze.storageTypeSession);
      return e ? JSON.parse(e) : null;
    }
    init() {
      document.addEventListener("visibilitychange", () => {
        "visible" === document.visibilityState && this.updateSession();
      }),
        e.faro.metas.addListener(function (n) {
          const t = n.session,
            i = ze.fetchUserSession();
          if (t && t.id !== (null == i ? void 0 : i.sessionId)) {
            const n = Ue(_e({ sessionId: t.id, isSampled: Ne() }), i);
            ze.storeUserSession(n), e.faro.api.setSession(n.sessionMeta);
          }
        });
    }
  }
  ze.storageTypeSession = we;
  class Fe extends Y {
    constructor() {
      super(...arguments),
        (this.name = "@grafana/faro-web-sdk:instrumentation-session"),
        (this.version = Q);
    }
    sendSessionStartEvent(e) {
      var n, t;
      const i = e.session;
      if (
        i &&
        i.id !==
          (null === (n = this.notifiedSession) || void 0 === n ? void 0 : n.id)
      ) {
        if (
          this.notifiedSession &&
          this.notifiedSession.id ===
            (null === (t = i.attributes) || void 0 === t
              ? void 0
              : t.previousSession)
        )
          return (
            this.api.pushEvent(ce, {}, void 0, { skipDedupe: !0 }),
            void (this.notifiedSession = i)
          );
        (this.notifiedSession = i),
          this.api.pushEvent(le, {}, void 0, { skipDedupe: !0 });
      }
    }
    createInitialSessionMeta(e) {
      var n, t, i;
      let o = (e.persistent ? Be : ze).fetchUserSession();
      if (e.persistent && e.maxSessionPersistenceTime && o) {
        const n = N();
        o.lastActivity < n - e.maxSessionPersistenceTime &&
          (Be.removeUserSession(), (o = null));
      }
      let r,
        s = null === (n = e.session) || void 0 === n ? void 0 : n.id,
        a = null === (t = e.session) || void 0 === t ? void 0 : t.attributes;
      Pe(o)
        ? ((s = null == o ? void 0 : o.sessionId),
          (a = Object.assign(
            Object.assign(
              Object.assign({}, a),
              null === (i = null == o ? void 0 : o.sessionMeta) || void 0 === i
                ? void 0
                : i.attributes
            ),
            { isSampled: (o.isSampled || !1).toString() }
          )),
          (r = ue))
        : ((s = null != s ? s : be().id), (r = le));
      return {
        sessionMeta: {
          id: s,
          attributes: Object.assign({ isSampled: Ne().toString() }, a),
        },
        lifecycleType: r,
      };
    }
    registerBeforeSendHook(e) {
      var n;
      const { updateSession: t } = new e();
      null === (n = this.transports) ||
        void 0 === n ||
        n.addBeforeSendHooks((e) => {
          var n, i, o;
          t();
          const r =
            null === (n = e.meta.session) || void 0 === n
              ? void 0
              : n.attributes;
          if (r && "true" === (null == r ? void 0 : r.isSampled)) {
            let n;
            n =
              "structuredClone" in window
                ? structuredClone(e)
                : JSON.parse(JSON.stringify(e));
            const t =
              null === (i = n.meta.session) || void 0 === i
                ? void 0
                : i.attributes;
            return (
              null == t || delete t.isSampled,
              0 === Object.keys(null != t ? t : {}).length &&
                (null === (o = n.meta.session) ||
                  void 0 === o ||
                  delete o.attributes),
              n
            );
          }
          return null;
        });
    }
    initialize() {
      var e, n;
      this.logDebug("init session instrumentation");
      const t = this.config.sessionTracking;
      if (null == t ? void 0 : t.enabled) {
        const i = (
          null === (e = this.config.sessionTracking) || void 0 === e
            ? void 0
            : e.persistent
        )
          ? Be
          : ze;
        this.registerBeforeSendHook(i);
        const { sessionMeta: o, lifecycleType: r } =
          this.createInitialSessionMeta(t);
        i.storeUserSession(
          Object.assign(
            Object.assign(
              {},
              _e({
                sessionId: o.id,
                isSampled:
                  "true" ===
                  (null === (n = o.attributes) || void 0 === n
                    ? void 0
                    : n.isSampled),
              })
            ),
            { sessionMeta: o }
          )
        ),
          (this.notifiedSession = o),
          this.api.setSession(o),
          r === le && this.api.pushEvent(le, {}, void 0, { skipDedupe: !0 }),
          r === ue && this.api.pushEvent(ue, {}, void 0, { skipDedupe: !0 });
      }
      this.metas.addListener(this.sendSessionStartEvent.bind(this));
    }
  }
  class Ve extends Y {
    constructor(e = {}) {
      super(),
        (this.options = e),
        (this.name = "@grafana/faro-web-sdk:instrumentation-console"),
        (this.version = Q);
    }
    initialize() {
      this.logDebug("Initializing\n", this.options),
        k
          .filter((e) => {
            var n;
            return !(
              null !== (n = this.options.disabledLevels) && void 0 !== n
                ? n
                : Ve.defaultDisabledLevels
            ).includes(e);
          })
          .forEach((e) => {
            console[e] = (...n) => {
              try {
                this.api.pushLog(n, { level: e });
              } catch (e) {
                this.logError(e);
              } finally {
                this.unpatchedConsole[e](...n);
              }
            };
          });
    }
  }
  Ve.defaultDisabledLevels = [
    e.LogLevel.DEBUG,
    e.LogLevel.TRACE,
    e.LogLevel.LOG,
  ];
  const $e =
      /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i,
    qe =
      /^\s*at (?:(.*\).*?|.*?) ?\((?:address at )?)?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
    Ge = /\((\S*)(?::(\d+))(?::(\d+))\)/,
    He = "address at ",
    We = He.length,
    Ke =
      /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:file|https?|blob|chrome|webpack|resource|moz-extension|safari-extension|safari-web-extension|capacitor)?:\/.*?|\[native code]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,
    Je = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
    Xe = "safari-extension",
    Ze = "safari-web-extension",
    Ye = /Minified React error #\d+;/i;
  function Qe(e, n, t, i) {
    const o = { filename: e || document.location.href, function: n || "?" };
    return void 0 !== t && (o.lineno = t), void 0 !== i && (o.colno = i), o;
  }
  function en(e, n) {
    const t = null == e ? void 0 : e.includes(Xe),
      i = !t && (null == e ? void 0 : e.includes(Ze));
    return t || i
      ? [
          (null == e ? void 0 : e.includes("@")) ? e.split("@")[0] : e,
          t ? `${Xe}:${n}` : `${Ze}:${n}`,
        ]
      : [e, n];
  }
  function nn(e) {
    let n = [];
    e.stacktrace
      ? (n = e.stacktrace.split("\n").filter((e, n) => n % 2 == 0))
      : e.stack && (n = e.stack.split("\n"));
    const t = n.reduce((n, t, i) => {
      let o, r, a, l, u;
      if ((o = qe.exec(t))) {
        if (
          ((r = o[1]),
          (a = o[2]),
          (l = o[3]),
          (u = o[4]),
          null == a ? void 0 : a.startsWith("eval"))
        ) {
          const e = Ge.exec(a);
          e && ((a = e[1]), (l = e[2]), (u = e[3]));
        }
        (a = (null == a ? void 0 : a.startsWith(He)) ? a.substring(We) : a),
          ([r, a] = en(r, a));
      } else if ((o = Ke.exec(t))) {
        if (
          ((r = o[1]),
          (a = o[3]),
          (l = o[4]),
          (u = o[5]),
          a && a.includes(" > eval"))
        ) {
          const e = Je.exec(a);
          e && ((r = r || "eval"), (a = e[1]), (l = e[2]));
        } else
          0 === i &&
            !u &&
            s(e.columnNumber) &&
            (u = String(e.columnNumber + 1));
        [r, a] = en(r, a);
      }
      return (
        (a || r) &&
          n.push(Qe(a, r, l ? Number(l) : void 0, u ? Number(u) : void 0)),
        n
      );
    }, []);
    return Ye.test(e.message) ? t.slice(1) : t;
  }
  function tn(e) {
    return { frames: nn(e) };
  }
  function on(e) {
    let n,
      t,
      i,
      o,
      r = [];
    if (m(e) && e.error)
      (n = e.error.message), (t = e.error.name), (r = nn(e.error));
    else if ((i = v(e)) || b(e)) {
      const { name: o, message: r } = e;
      (t = null != o ? o : i ? "DOMError" : "DOMException"),
        (n = r ? `${t}: ${r}` : t);
    } else
      g(e)
        ? ((n = e.message), (r = nn(e)))
        : (a(e) || (o = p(e))) &&
          ((t = o ? e.constructor.name : void 0),
          (n = `Non-Error exception captured with keys: ${Object.keys(e)}`));
    return [n, t, r];
  }
  function rn(e) {
    const n = window.onerror;
    window.onerror = (...t) => {
      try {
        const [i, o, s, a, l] = t;
        let u,
          c,
          d = [];
        const p = r(i),
          f = Qe(o, "?", s, a);
        l || !p
          ? (([u, c, d] = on(null != l ? l : i)), 0 === d.length && (d = [f]))
          : p &&
            (([u, c] = (function (e) {
              var n, t;
              const i = e.match($e),
                o =
                  null !== (n = null == i ? void 0 : i[1]) && void 0 !== n
                    ? n
                    : K;
              return [
                null !== (t = null == i ? void 0 : i[2]) && void 0 !== t
                  ? t
                  : e,
                o,
              ];
            })(i)),
            (d = [f])),
          u && e.pushError(new Error(u), { type: c, stackFrames: d });
      } finally {
        null == n || n.apply(window, t);
      }
    };
  }
  class sn extends Y {
    constructor() {
      super(...arguments),
        (this.name = "@grafana/faro-web-sdk:instrumentation-errors"),
        (this.version = Q);
    }
    initialize() {
      var e;
      this.logDebug("Initializing"),
        rn(this.api),
        (e = this.api),
        window.addEventListener("unhandledrejection", (n) => {
          var t, i;
          let o,
            r,
            s = n;
          s.reason
            ? (s = n.reason)
            : (null === (t = n.detail) || void 0 === t ? void 0 : t.reason) &&
              (s = null === (i = n.detail) || void 0 === i ? void 0 : i.reason);
          let a = [];
          c(s)
            ? ((o = `Non-Error promise rejection captured with value: ${String(
                s
              )}`),
              (r = "UnhandledRejection"))
            : ([o, r, a] = on(s)),
            o && e.pushError(new Error(o), { type: r, stackFrames: a });
        });
    }
  }
  class an extends Y {
    constructor() {
      super(...arguments),
        (this.name = "@grafana/faro-web-sdk:instrumentation-view"),
        (this.version = Q);
    }
    sendViewChangedEvent(e) {
      var n, t, i;
      const o = e.view;
      o &&
        o.name !==
          (null === (n = this.notifiedView) || void 0 === n
            ? void 0
            : n.name) &&
        (this.api.pushEvent(
          ae,
          {
            fromView:
              null !==
                (i =
                  null === (t = this.notifiedView) || void 0 === t
                    ? void 0
                    : t.name) && void 0 !== i
                ? i
                : "",
            toView: o.name,
          },
          void 0,
          { skipDedupe: !0 }
        ),
        (this.notifiedView = o));
    }
    initialize() {
      this.sendViewChangedEvent(this.metas.value),
        this.metas.addListener(this.sendViewChangedEvent.bind(this));
    }
  }
  var ln,
    un,
    cn,
    dn,
    pn,
    fn = -1,
    gn = function (e) {
      addEventListener(
        "pageshow",
        function (n) {
          n.persisted && ((fn = n.timeStamp), e(n));
        },
        !0
      );
    },
    mn = function () {
      return (
        window.performance &&
        performance.getEntriesByType &&
        performance.getEntriesByType("navigation")[0]
      );
    },
    vn = function () {
      var e = mn();
      return (e && e.activationStart) || 0;
    },
    bn = function (e, n) {
      var t = mn(),
        i = "navigate";
      return (
        fn >= 0
          ? (i = "back-forward-cache")
          : t &&
            (document.prerendering || vn() > 0
              ? (i = "prerender")
              : document.wasDiscarded
              ? (i = "restore")
              : t.type && (i = t.type.replace(/_/g, "-"))),
        {
          name: e,
          value: void 0 === n ? -1 : n,
          rating: "good",
          delta: 0,
          entries: [],
          id: "v3-"
            .concat(Date.now(), "-")
            .concat(Math.floor(8999999999999 * Math.random()) + 1e12),
          navigationType: i,
        }
      );
    },
    hn = function (e, n, t) {
      try {
        if (PerformanceObserver.supportedEntryTypes.includes(e)) {
          var i = new PerformanceObserver(function (e) {
            Promise.resolve().then(function () {
              n(e.getEntries());
            });
          });
          return (
            i.observe(Object.assign({ type: e, buffered: !0 }, t || {})), i
          );
        }
      } catch (e) {}
    },
    wn = function (e, n, t, i) {
      var o, r;
      return function (s) {
        n.value >= 0 &&
          (s || i) &&
          ((r = n.value - (o || 0)) || void 0 === o) &&
          ((o = n.value),
          (n.delta = r),
          (n.rating = (function (e, n) {
            return e > n[1] ? "poor" : e > n[0] ? "needs-improvement" : "good";
          })(n.value, t)),
          e(n));
      };
    },
    yn = function (e) {
      requestAnimationFrame(function () {
        return requestAnimationFrame(function () {
          return e();
        });
      });
    },
    Sn = function (e) {
      var n = function (n) {
        ("pagehide" !== n.type && "hidden" !== document.visibilityState) ||
          e(n);
      };
      addEventListener("visibilitychange", n, !0),
        addEventListener("pagehide", n, !0);
    },
    En = function (e) {
      var n = !1;
      return function (t) {
        n || (e(t), (n = !0));
      };
    },
    Tn = -1,
    kn = function () {
      return "hidden" !== document.visibilityState || document.prerendering
        ? 1 / 0
        : 0;
    },
    In = function (e) {
      "hidden" === document.visibilityState &&
        Tn > -1 &&
        ((Tn = "visibilitychange" === e.type ? e.timeStamp : 0), On());
    },
    xn = function () {
      addEventListener("visibilitychange", In, !0),
        addEventListener("prerenderingchange", In, !0);
    },
    On = function () {
      removeEventListener("visibilitychange", In, !0),
        removeEventListener("prerenderingchange", In, !0);
    },
    Ln = function () {
      return (
        Tn < 0 &&
          ((Tn = kn()),
          xn(),
          gn(function () {
            setTimeout(function () {
              (Tn = kn()), xn();
            }, 0);
          })),
        {
          get firstHiddenTime() {
            return Tn;
          },
        }
      );
    },
    Nn = function (e) {
      document.prerendering
        ? addEventListener(
            "prerenderingchange",
            function () {
              return e();
            },
            !0
          )
        : e();
    },
    jn = [1800, 3e3],
    An = function (e, n) {
      (n = n || {}),
        Nn(function () {
          var t,
            i = Ln(),
            o = bn("FCP"),
            r = hn("paint", function (e) {
              e.forEach(function (e) {
                "first-contentful-paint" === e.name &&
                  (r.disconnect(),
                  e.startTime < i.firstHiddenTime &&
                    ((o.value = Math.max(e.startTime - vn(), 0)),
                    o.entries.push(e),
                    t(!0)));
              });
            });
          r &&
            ((t = wn(e, o, jn, n.reportAllChanges)),
            gn(function (i) {
              (o = bn("FCP")),
                (t = wn(e, o, jn, n.reportAllChanges)),
                yn(function () {
                  (o.value = performance.now() - i.timeStamp), t(!0);
                });
            }));
        });
    },
    Cn = [0.1, 0.25],
    Rn = { passive: !0, capture: !0 },
    Mn = new Date(),
    _n = function (e, n) {
      ln ||
        ((ln = n), (un = e), (cn = new Date()), Un(removeEventListener), Pn());
    },
    Pn = function () {
      if (un >= 0 && un < cn - Mn) {
        var e = {
          entryType: "first-input",
          name: ln.type,
          target: ln.target,
          cancelable: ln.cancelable,
          startTime: ln.timeStamp,
          processingStart: ln.timeStamp + un,
        };
        dn.forEach(function (n) {
          n(e);
        }),
          (dn = []);
      }
    },
    Dn = function (e) {
      if (e.cancelable) {
        var n =
          (e.timeStamp > 1e12 ? new Date() : performance.now()) - e.timeStamp;
        "pointerdown" == e.type
          ? (function (e, n) {
              var t = function () {
                  _n(e, n), o();
                },
                i = function () {
                  o();
                },
                o = function () {
                  removeEventListener("pointerup", t, Rn),
                    removeEventListener("pointercancel", i, Rn);
                };
              addEventListener("pointerup", t, Rn),
                addEventListener("pointercancel", i, Rn);
            })(n, e)
          : _n(n, e);
      }
    },
    Un = function (e) {
      ["mousedown", "keydown", "touchstart", "pointerdown"].forEach(function (
        n
      ) {
        return e(n, Dn, Rn);
      });
    },
    Bn = [100, 300],
    zn = 0,
    Fn = 1 / 0,
    Vn = 0,
    $n = function (e) {
      e.forEach(function (e) {
        e.interactionId &&
          ((Fn = Math.min(Fn, e.interactionId)),
          (Vn = Math.max(Vn, e.interactionId)),
          (zn = Vn ? (Vn - Fn) / 7 + 1 : 0));
      });
    },
    qn = function () {
      return pn ? zn : performance.interactionCount || 0;
    },
    Gn = function () {
      "interactionCount" in performance ||
        pn ||
        (pn = hn("event", $n, {
          type: "event",
          buffered: !0,
          durationThreshold: 0,
        }));
    },
    Hn = [200, 500],
    Wn = 0,
    Kn = function () {
      return qn() - Wn;
    },
    Jn = [],
    Xn = {},
    Zn = function (e) {
      var n = Jn[Jn.length - 1],
        t = Xn[e.interactionId];
      if (t || Jn.length < 10 || e.duration > n.latency) {
        if (t) t.entries.push(e), (t.latency = Math.max(t.latency, e.duration));
        else {
          var i = { id: e.interactionId, latency: e.duration, entries: [e] };
          (Xn[i.id] = i), Jn.push(i);
        }
        Jn.sort(function (e, n) {
          return n.latency - e.latency;
        }),
          Jn.splice(10).forEach(function (e) {
            delete Xn[e.id];
          });
      }
    },
    Yn = [2500, 4e3],
    Qn = {},
    et = [800, 1800],
    nt = function e(n) {
      document.prerendering
        ? Nn(function () {
            return e(n);
          })
        : "complete" !== document.readyState
        ? addEventListener(
            "load",
            function () {
              return e(n);
            },
            !0
          )
        : setTimeout(n, 0);
    };
  class tt extends Y {
    constructor() {
      super(...arguments),
        (this.name = "@grafana/faro-web-sdk:instrumentation-web-vitals"),
        (this.version = Q);
    }
    initialize() {
      this.logDebug("Initializing"),
        Object.entries(tt.mapping).forEach(([e, n]) => {
          n((n) => {
            this.api.pushMeasurement({
              type: "web-vitals",
              values: { [e]: n.value },
            });
          });
        });
    }
  }
  function it(e, n, t, i) {
    return new (t || (t = Promise))(function (o, r) {
      function s(e) {
        try {
          l(i.next(e));
        } catch (e) {
          r(e);
        }
      }
      function a(e) {
        try {
          l(i.throw(e));
        } catch (e) {
          r(e);
        }
      }
      function l(e) {
        var n;
        e.done
          ? o(e.value)
          : ((n = e.value),
            n instanceof t
              ? n
              : new t(function (e) {
                  e(n);
                })).then(s, a);
      }
      l((i = i.apply(e, n || [])).next());
    });
  }
  (tt.mapping = {
    cls: function (e, n) {
      (n = n || {}),
        An(
          En(function () {
            var t,
              i = bn("CLS", 0),
              o = 0,
              r = [],
              s = function (e) {
                e.forEach(function (e) {
                  if (!e.hadRecentInput) {
                    var n = r[0],
                      t = r[r.length - 1];
                    o &&
                    e.startTime - t.startTime < 1e3 &&
                    e.startTime - n.startTime < 5e3
                      ? ((o += e.value), r.push(e))
                      : ((o = e.value), (r = [e]));
                  }
                }),
                  o > i.value && ((i.value = o), (i.entries = r), t());
              },
              a = hn("layout-shift", s);
            a &&
              ((t = wn(e, i, Cn, n.reportAllChanges)),
              Sn(function () {
                s(a.takeRecords()), t(!0);
              }),
              gn(function () {
                (o = 0),
                  (i = bn("CLS", 0)),
                  (t = wn(e, i, Cn, n.reportAllChanges)),
                  yn(function () {
                    return t();
                  });
              }),
              setTimeout(t, 0));
          })
        );
    },
    fcp: An,
    fid: function (e, n) {
      (n = n || {}),
        Nn(function () {
          var t,
            i = Ln(),
            o = bn("FID"),
            r = function (e) {
              e.startTime < i.firstHiddenTime &&
                ((o.value = e.processingStart - e.startTime),
                o.entries.push(e),
                t(!0));
            },
            s = function (e) {
              e.forEach(r);
            },
            a = hn("first-input", s);
          (t = wn(e, o, Bn, n.reportAllChanges)),
            a &&
              Sn(
                En(function () {
                  s(a.takeRecords()), a.disconnect();
                })
              ),
            a &&
              gn(function () {
                var i;
                (o = bn("FID")),
                  (t = wn(e, o, Bn, n.reportAllChanges)),
                  (dn = []),
                  (un = -1),
                  (ln = null),
                  Un(addEventListener),
                  (i = r),
                  dn.push(i),
                  Pn();
              });
        });
    },
    inp: function (e, n) {
      (n = n || {}),
        Nn(function () {
          var t;
          Gn();
          var i,
            o = bn("INP"),
            r = function (e) {
              e.forEach(function (e) {
                e.interactionId && Zn(e),
                  "first-input" === e.entryType &&
                    !Jn.some(function (n) {
                      return n.entries.some(function (n) {
                        return (
                          e.duration === n.duration &&
                          e.startTime === n.startTime
                        );
                      });
                    }) &&
                    Zn(e);
              });
              var n,
                t =
                  ((n = Math.min(Jn.length - 1, Math.floor(Kn() / 50))), Jn[n]);
              t &&
                t.latency !== o.value &&
                ((o.value = t.latency), (o.entries = t.entries), i());
            },
            s = hn("event", r, {
              durationThreshold:
                null !== (t = n.durationThreshold) && void 0 !== t ? t : 40,
            });
          (i = wn(e, o, Hn, n.reportAllChanges)),
            s &&
              ("interactionId" in PerformanceEventTiming.prototype &&
                s.observe({ type: "first-input", buffered: !0 }),
              Sn(function () {
                r(s.takeRecords()),
                  o.value < 0 && Kn() > 0 && ((o.value = 0), (o.entries = [])),
                  i(!0);
              }),
              gn(function () {
                (Jn = []),
                  (Wn = qn()),
                  (o = bn("INP")),
                  (i = wn(e, o, Hn, n.reportAllChanges));
              }));
        });
    },
    lcp: function (e, n) {
      (n = n || {}),
        Nn(function () {
          var t,
            i = Ln(),
            o = bn("LCP"),
            r = function (e) {
              var n = e[e.length - 1];
              n &&
                n.startTime < i.firstHiddenTime &&
                ((o.value = Math.max(n.startTime - vn(), 0)),
                (o.entries = [n]),
                t());
            },
            s = hn("largest-contentful-paint", r);
          if (s) {
            t = wn(e, o, Yn, n.reportAllChanges);
            var a = En(function () {
              Qn[o.id] ||
                (r(s.takeRecords()), s.disconnect(), (Qn[o.id] = !0), t(!0));
            });
            ["keydown", "click"].forEach(function (e) {
              addEventListener(
                e,
                function () {
                  return setTimeout(a, 0);
                },
                !0
              );
            }),
              Sn(a),
              gn(function (i) {
                (o = bn("LCP")),
                  (t = wn(e, o, Yn, n.reportAllChanges)),
                  yn(function () {
                    (o.value = performance.now() - i.timeStamp),
                      (Qn[o.id] = !0),
                      t(!0);
                  });
              });
          }
        });
    },
    ttfb: function (e, n) {
      n = n || {};
      var t = bn("TTFB"),
        i = wn(e, t, et, n.reportAllChanges);
      nt(function () {
        var o = mn();
        if (o) {
          var r = o.responseStart;
          if (r <= 0 || r > performance.now()) return;
          (t.value = Math.max(r - vn(), 0)),
            (t.entries = [o]),
            i(!0),
            gn(function () {
              (t = bn("TTFB", 0)), (i = wn(e, t, et, n.reportAllChanges))(!0);
            });
        }
      });
    },
  }),
    "function" == typeof SuppressedError && SuppressedError;
  const ot = "com.grafana.faro.lastNavigationId";
  function rt(e = [], n) {
    return e.some((e) => null != n.match(e));
  }
  function st(e) {
    const {
      connectEnd: n,
      connectStart: t,
      decodedBodySize: i,
      domainLookupEnd: o,
      domainLookupStart: r,
      encodedBodySize: s,
      fetchStart: a,
      initiatorType: l,
      name: u,
      nextHopProtocol: c,
      redirectEnd: d,
      redirectStart: p,
      renderBlockingStatus: f,
      requestStart: g,
      responseEnd: m,
      responseStart: v,
      responseStatus: b,
      secureConnectionStart: h,
      transferSize: w,
      workerStart: y,
    } = e;
    return {
      name: u,
      tcpHandshakeTime: at(n - t),
      dnsLookupTime: at(o - r),
      tlsNegotiationTime: at(g - h),
      redirectTime: at(d - p),
      requestTime: at(v - g),
      responseTime: at(m - v),
      fetchTime: at(m - a),
      serviceWorkerTime: at(a - y),
      decodedBodySize: at(i),
      encodedBodySize: at(s),
      cacheHitStatus: (function () {
        let e = "fullLoad";
        0 === w
          ? i > 0 && (e = "cache")
          : null != b
          ? 304 === b && (e = "conditionalFetch")
          : s > 0 && w < s && (e = "conditionalFetch");
        return e;
      })(),
      renderBlockingStatus: at(f),
      protocol: c,
      initiatorType: l,
    };
  }
  function at(e) {
    return null == e
      ? "unknown"
      : "number" == typeof e
      ? Math.round(e).toString()
      : e.toString();
  }
  function lt(e, n) {
    let t;
    const i = new Promise((e) => {
      t = e;
    });
    return (
      new PerformanceObserver((i) => {
        var o;
        const [r] = i.getEntries();
        if (null == r || rt(n, r.name)) return;
        const s = null !== (o = Ee(ot, we)) && void 0 !== o ? o : "unknown",
          a = Object.assign(
            Object.assign(
              Object.assign({}, st(r.toJSON())),
              (function (e) {
                const {
                  activationStart: n,
                  domComplete: t,
                  domContentLoadedEventEnd: i,
                  domContentLoadedEventStart: o,
                  domInteractive: r,
                  duration: s,
                  fetchStart: a,
                  loadEventEnd: l,
                  loadEventStart: u,
                  responseStart: c,
                  type: d,
                } = e;
                return {
                  visibilityState: document.visibilityState,
                  totalNavigationTime: at(s),
                  pageLoadTime: at(t - a),
                  domProcessingTime: at(t - r),
                  domContentLoadHandlerTime: at(i - o),
                  onLoadTime: at(l - u),
                  ttfb: at(Math.max(c - (null != n ? n : 0), 0)),
                  type: d,
                };
              })(r.toJSON())
            ),
            { faroNavigationId: L(), faroPreviousNavigationId: s }
          );
        Te(ot, a.faroNavigationId, we),
          e("faro.performance.navigation", a),
          t(a);
      }).observe({ type: "navigation", buffered: !0 }),
      i
    );
  }
  class ut extends Y {
    constructor() {
      super(...arguments),
        (this.name = "@grafana/faro-web-sdk:instrumentation-performance"),
        (this.version = Q);
    }
    initialize() {
      "PerformanceObserver" in window
        ? (function (e) {
            if ("complete" === document.readyState) e();
            else {
              const n = () => {
                "complete" === document.readyState &&
                  (e(), document.removeEventListener("readystatechange", n));
              };
              document.addEventListener("readystatechange", n);
            }
          })(() =>
            it(this, void 0, void 0, function* () {
              const e = this.api.pushEvent,
                n = this.getIgnoreUrls(),
                { faroNavigationId: t } = yield lt(e, n);
              null != t &&
                (function (e, n, t) {
                  new PerformanceObserver((i) => {
                    const o = i.getEntries();
                    for (const i of o) {
                      if (rt(t, i.name)) return;
                      const o = Object.assign(
                        Object.assign({}, st(i.toJSON())),
                        { faroNavigationId: e, faroResourceId: L() }
                      );
                      n("faro.performance.resource", o);
                    }
                  }).observe({ type: "resource", buffered: !0 });
                })(t, e, n);
            })
          )
        : this.logDebug(
            "performance observer not supported. Disable performance instrumentation."
          );
    }
    getIgnoreUrls() {
      var e;
      return null === (e = this.transports.transports) || void 0 === e
        ? void 0
        : e.flatMap((e) => e.getIgnoreUrls());
    }
  }
  function ct(e = {}) {
    const n = [new sn(), new tt(), new Fe(), new an()];
    return (
      !0 === e.enablePerformanceInstrumentation && n.unshift(new ut()),
      !1 !== e.captureConsole &&
        n.push(new Ve({ disabledLevels: e.captureConsoleDisabledLevels })),
      n
    );
  }
  const dt = "browser",
    pt = () => ({ k6: { isK6Browser: !0 } });
  class ft extends G {
    constructor(e) {
      var n, t, i, o;
      super(),
        (this.options = e),
        (this.name = "@grafana/faro-web-sdk:transport-fetch"),
        (this.version = Q),
        (this.disabledUntil = new Date()),
        (this.rateLimitBackoffMs =
          null !== (n = e.defaultRateLimitBackoffMs) && void 0 !== n ? n : 5e3),
        (this.getNow =
          null !== (t = e.getNow) && void 0 !== t ? t : () => Date.now()),
        (this.promiseBuffer = x({
          size: null !== (i = e.bufferSize) && void 0 !== i ? i : 30,
          concurrency: null !== (o = e.concurrency) && void 0 !== o ? o : 5,
        }));
    }
    send(e) {
      return it(this, void 0, void 0, function* () {
        try {
          if (this.disabledUntil > new Date(this.getNow()))
            return (
              this.logWarn(
                `Dropping transport item due to too many requests. Backoff until ${this.disabledUntil}`
              ),
              Promise.resolve()
            );
          yield this.promiseBuffer.add(() => {
            const n = JSON.stringify(W(e)),
              { url: t, requestOptions: i, apiKey: o } = this.options,
              r = null != i ? i : {},
              { headers: s } = r,
              a = (function (e, n) {
                var t = {};
                for (var i in e)
                  Object.prototype.hasOwnProperty.call(e, i) &&
                    n.indexOf(i) < 0 &&
                    (t[i] = e[i]);
                if (
                  null != e &&
                  "function" == typeof Object.getOwnPropertySymbols
                ) {
                  var o = 0;
                  for (i = Object.getOwnPropertySymbols(e); o < i.length; o++)
                    n.indexOf(i[o]) < 0 &&
                      Object.prototype.propertyIsEnumerable.call(e, i[o]) &&
                      (t[i[o]] = e[i[o]]);
                }
                return t;
              })(r, ["headers"]);
            let l;
            const u = this.metas.value.session;
            return (
              null != u && (l = u.id),
              fetch(
                t,
                Object.assign(
                  {
                    method: "POST",
                    headers: Object.assign(
                      Object.assign(
                        Object.assign(
                          { "Content-Type": "application/json" },
                          null != s ? s : {}
                        ),
                        o ? { "x-api-key": o } : {}
                      ),
                      l ? { "x-faro-session-id": l } : {}
                    ),
                    body: n,
                    keepalive: n.length <= 6e4,
                  },
                  null != a ? a : {}
                )
              )
                .then(
                  (e) => (
                    429 === e.status &&
                      ((this.disabledUntil = this.getRetryAfterDate(e)),
                      this.logWarn(
                        `Too many requests, backing off until ${this.disabledUntil}`
                      )),
                    e.text().catch(I),
                    e
                  )
                )
                .catch((e) => {
                  this.logError(
                    "Failed sending payload to the receiver\n",
                    JSON.parse(n),
                    e
                  );
                })
            );
          });
        } catch (e) {
          this.logError(e);
        }
      });
    }
    getIgnoreUrls() {
      return [this.options.url];
    }
    isBatched() {
      return !0;
    }
    getRetryAfterDate(e) {
      const n = this.getNow(),
        t = e.headers.get("Retry-After");
      if (t) {
        const e = Number(t);
        if (!isNaN(e)) return new Date(1e3 * e + n);
        const i = Date.parse(t);
        if (!isNaN(i)) return new Date(i);
      }
      return new Date(n + this.rateLimitBackoffMs);
    }
  }
  function gt(e) {
    var n, t, i, o, r, s, l, u, c;
    const d = [],
      p = F(e.unpatchedConsole, e.internalLoggerLevel);
    e.transports
      ? ((e.url || e.apiKey) &&
          p.error(
            'if "transports" is defined, "url" and "apiKey" should not be defined'
          ),
        d.push(...e.transports))
      : e.url
      ? d.push(new ft({ url: e.url, apiKey: e.apiKey }))
      : p.error('either "url" or "transports" must be defined');
    return {
      app: e.app,
      batching: Object.assign(Object.assign({}, se), e.batching),
      dedupe: null === (n = e.dedupe) || void 0 === n || n,
      globalObjectKey: e.globalObjectKey || re,
      instrumentations:
        null !== (t = e.instrumentations) && void 0 !== t ? t : ct(),
      internalLoggerLevel:
        null !== (i = e.internalLoggerLevel) && void 0 !== i ? i : D,
      isolate: null !== (o = e.isolate) && void 0 !== o && o,
      metas: (function () {
        const n = ve;
        return e.metas && n.push(...e.metas), a(window.k6) ? [...n, pt] : n;
      })(),
      parseStacktrace: tn,
      paused: null !== (r = e.paused) && void 0 !== r && r,
      preventGlobalExposure:
        null !== (s = e.preventGlobalExposure) && void 0 !== s && s,
      transports: d,
      unpatchedConsole:
        null !== (l = e.unpatchedConsole) && void 0 !== l ? l : U,
      beforeSend: e.beforeSend,
      eventDomain: null !== (u = e.eventDomain) && void 0 !== u ? u : dt,
      ignoreErrors: e.ignoreErrors,
      sessionTracking: Object.assign(Object.assign({}, Me), e.sessionTracking),
      user: e.user,
      view: null !== (c = e.view) && void 0 !== c ? c : he,
    };
  }
  return (
    (e.BaseExtension = q),
    (e.BaseInstrumentation = Y),
    (e.BaseTransport = G),
    (e.ConsoleInstrumentation = Ve),
    (e.ConsoleTransport = class extends G {
      constructor(e = {}) {
        super(),
          (this.options = e),
          (this.name = "@grafana/faro-web-sdk:transport-console"),
          (this.version = Q);
      }
      send(n) {
        var t;
        return this.unpatchedConsole[
          null !== (t = this.options.level) && void 0 !== t
            ? t
            : e.LogLevel.DEBUG
        ]("New event", W([n]));
      }
    }),
    (e.Conventions = {
      EventNames: {
        CLICK: "click",
        NAVIGATION: "navigation",
        SESSION_START: "session_start",
        VIEW_CHANGED: "view_changed",
      },
    }),
    (e.EVENT_CLICK = "click"),
    (e.EVENT_NAVIGATION = "navigation"),
    (e.EVENT_ROUTE_CHANGE = "route_change"),
    (e.EVENT_SESSION_EXTEND = ce),
    (e.EVENT_SESSION_RESUME = ue),
    (e.EVENT_SESSION_START = le),
    (e.EVENT_VIEW_CHANGED = ae),
    (e.ErrorsInstrumentation = sn),
    (e.FetchTransport = ft),
    (e.MAX_SESSION_PERSISTENCE_TIME = Re),
    (e.MAX_SESSION_PERSISTENCE_TIME_BUFFER = 6e4),
    (e.PerformanceInstrumentation = ut),
    (e.PersistentSessionsManager = Be),
    (e.SESSION_EXPIRATION_TIME = Ae),
    (e.SESSION_INACTIVITY_TIME = Ce),
    (e.STORAGE_KEY = je),
    (e.SessionInstrumentation = Fe),
    (e.VERSION = Q),
    (e.ViewInstrumentation = an),
    (e.VolatileSessionsManager = ze),
    (e.WebVitalsInstrumentation = tt),
    (e.allLogLevels = k),
    (e.browserMeta = ge),
    (e.buildStackFrame = Qe),
    (e.createInternalLogger = F),
    (e.createPromiseBuffer = x),
    (e.createSession = be),
    (e.deepEqual = y),
    (e.defaultEventDomain = dt),
    (e.defaultExceptionType = K),
    (e.defaultGlobalObjectKey = re),
    (e.defaultInternalLoggerLevel = D),
    (e.defaultLogLevel = T),
    (e.defaultMetas = ve),
    (e.defaultViewMeta = he),
    (e.genShortID = L),
    (e.getCurrentTimestamp = S),
    (e.getDataFromSafariExtensions = en),
    (e.getInternalFaroFromGlobalObject = function () {
      return Z[ee];
    }),
    (e.getStackFramesFromError = nn),
    (e.getTransportBody = W),
    (e.getWebInstrumentations = ct),
    (e.globalObject = Z),
    (e.initializeFaro = function (e) {
      const n = gt(e);
      if (n) return oe(n);
    }),
    (e.internalGlobalObjectKey = ee),
    (e.isArray = u),
    (e.isBoolean = (e) => n(e, "boolean")),
    (e.isDomError = v),
    (e.isDomException = b),
    (e.isElement = (e) => h && i(e, Element)),
    (e.isElementDefined = h),
    (e.isError = g),
    (e.isErrorDefined = f),
    (e.isErrorEvent = m),
    (e.isEvent = p),
    (e.isEventDefined = d),
    (e.isFunction = l),
    (e.isInstanceOf = i),
    (e.isInt = (e) => s(e) && Number.isInteger(e)),
    (e.isInternalFaroOnGlobalObject = te),
    (e.isMap = (e) => w && i(e, Map)),
    (e.isMapDefined = w),
    (e.isNull = o),
    (e.isNumber = s),
    (e.isObject = a),
    (e.isPrimitive = c),
    (e.isRegExp = (e) => t(e, "RegExp")),
    (e.isString = r),
    (e.isSymbol = (e) => n(e, "symbol")),
    (e.isSyntheticEvent = (e) =>
      a(e) &&
      "nativeEvent" in e &&
      "preventDefault" in e &&
      "stopPropagation" in e),
    (e.isThenable = (e) => l(null == e ? void 0 : e.then)),
    (e.isToString = t),
    (e.isTypeof = n),
    (e.isUndefined = (e) => n(e, "undefined")),
    (e.makeCoreConfig = gt),
    (e.noop = I),
    (e.pageMeta = me),
    (e.parseStacktrace = tn),
    (e.sdkMeta = () => ({
      sdk: {
        name: "@grafana/faro-core",
        version: Q,
        integrations: e.faro.config.instrumentations.map(
          ({ name: e, version: n }) => ({ name: e, version: n })
        ),
      },
    })),
    (e.setInternalFaroOnGlobalObject = ne),
    (e.transportItemTypeToBodyKey = C),
    e
  );
})({});

window.GrafanaFaroWebSdk.initializeFaro({
  app: {
    name: "observeshop",
  },
  transports: [
    new window.GrafanaFaroWebSdk.FetchTransport({
      url: "https://141741533462.collect.observeinc.com/v1/http?source=faro",
      requestOptions: {
        headers: {
          Authorization:
            "Bearer ds1DBgMsiblIgCRKJ3kW:euytJ62qlDCsObOD4WsJBPoiWT-2JZPq",
        },
      },
    }),
  ],
  sessionTracking: {
    enabled: false,
  },
  batching: {
    enabled: true,
  },
});

window.addTracing = () => {
  window.GrafanaFaroWebSdk.faro.instrumentations.add(new window.GrafanaFaroWebTracing.TracingInstrumentation({}));
}
