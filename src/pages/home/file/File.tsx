import { Badge, HStack, VStack } from "@hope-ui/solid"
import { createMemo, createSignal, ErrorBoundary, Show, Suspense } from "solid-js"
import { Dynamic } from "solid-js/web"
import { Error, FullLoading, SelectWrapper } from "~/components"
import { objStore } from "~/store"
import { useRouter } from "~/hooks"
import { Download } from "../previews/download"
import { OpenWith } from "./open-with"
import { getPreviews } from "../previews"
import axios from "axios"

const fetchVisits = async (filename: string) => {
  try {
    const response = await axios.post(
      `/danmakuhub/visit?filename=${encodeURIComponent(filename)}`,
    )
    return response.data.visits
  } catch {
    return -1
  }
}

const File = () => {
  const { searchParams, setSearchParams } = useRouter()
  const previews = getPreviews({ ...objStore.obj, provider: objStore.provider })
  const cur = createMemo(() => {
    if (!previews.length) return undefined
    const selected = searchParams["preview"]
    if (selected) {
      const found = previews.find((item) => item.key === selected)
      if (found) return found
    }
    return previews[0]
  })
  const [visits, setVisits] = createSignal(-1)
  fetchVisits(objStore.obj.name).then((v) => setVisits(v))

  return (
    <Show when={previews.length > 1} fallback={<Download openWith />}>
      <VStack w="$full" spacing="$2">
        <div>
          <span>
            历史访问{" "}
            <Badge colorScheme={visits() == -1 ? "danger" : "success"}>
              {visits()}
            </Badge>
          </span>
        </div>
        <HStack w="$full" spacing="$2">
          <SelectWrapper
            alwaysShowBorder
            value={cur()?.key || ""}
            onChange={(key) => {
              setSearchParams({ preview: key }, { replace: true })
            }}
            options={previews.map((item) => ({
              value: item.key,
              label: item.name,
            }))}
          />
          <OpenWith />
        </HStack>
        <ErrorBoundary fallback={(err) => <Error msg={String(err)} />}>
          <Suspense fallback={<FullLoading />}>
            <Dynamic component={cur()?.component} />
          </Suspense>
        </ErrorBoundary>
      </VStack>
    </Show>
  )
}

export default File
