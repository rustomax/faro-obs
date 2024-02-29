window.init = () => {
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
      enabled: true,
      persistent: true
    },
    batching: {
      enabled: true,
    },
  });
};

window.addTracing = () => {
  window.GrafanaFaroWebSdk.faro.instrumentations.add(new window.GrafanaFaroWebTracing.TracingInstrumentation({}));
}
