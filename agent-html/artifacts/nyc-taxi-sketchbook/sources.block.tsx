import { Alert, AlertDescription } from "../../components/ui/alert"

import { taxiData } from "./data"
import { LedgerRows, SectionIntro } from "./sketch-components"

const sources = [
  {
    label: "NYC TLC Trip Record Data",
    note: "官方月度出租车行程数据页面。",
    url: "https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page",
  },
  {
    label: "Yellow Taxi Data Dictionary",
    note: "字段定义，包括时间、地点、费用、支付方式和小费字段。",
    url: "https://www.nyc.gov/assets/tlc/downloads/pdf/data_dictionary_trip_records_yellow.pdf",
  },
  {
    label: "yellow_tripdata_2024-10.parquet",
    note: "本 artifact 使用的原始月度 Parquet 文件。",
    url: taxiData.meta.generatedFrom,
  },
  {
    label: "Taxi zone lookup",
    note: "LocationID 到 borough / zone / service zone 的官方映射。",
    url: taxiData.meta.zoneLookup,
  },
]

export function SourcesBlock() {
  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="source register" title="数据源和清洗口径">
        页面图表来自官方 TLC 原始数据的本地聚合，不包含虚构行程，也不提交原始 Parquet 大文件。
      </SectionIntro>

      <LedgerRows
        items={sources.map((source) => ({
          label: source.label,
          note: source.note,
          value: (
            <a className="canvas-text-caption underline" href={source.url}>
              {source.url}
            </a>
          ),
        }))}
      />

      <Alert>
        <AlertDescription>
          清洗规则：{taxiData.meta.filters} {taxiData.meta.note}
        </AlertDescription>
      </Alert>
    </section>
  )
}
