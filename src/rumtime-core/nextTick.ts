const queue: any[] = []
let queueTarck = false

const P = Promise.resolve()
export function nextTick(fn) {
  return fn ? P.then(fn) : P
}

export function queueJobs(runner) {
  if (!queue.includes(runner)) {
    queue.push(runner)
  }
  queueFlush()
}


function queueFlush() {
  if (queueTarck) return
  queueTarck = true
  nextTick(flushJobs)
}

function flushJobs() {
  queueTarck = false
  let job
  while (job = queue.shift()) {
    job && job()
  }
}