import cx from "classnames";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { Dialog, Switch, Transition } from "@headlessui/react";
import {
  AdjustmentsIcon,
  CalendarIcon,
  CodeIcon,
} from "@heroicons/react/solid";
import { useBoolean } from "usehooks-ts";
import { DateTime, Duration } from "luxon";
import cronParser from "cron-parser";
import dedent from "ts-dedent";

export type Fields = {
  /** The name of the job */
  name: string;
  /** The endpoint URL to call */
  endpoint: string;
  /** Is the job enabled */
  enabled?: boolean;
  /** When to run the job ISO-8601 timestamp */
  runAt?: string;
  /** How often to run the job, ISO-8601 Duration */
  runEvery?: string;
  /** Headers to include with the request, collapsed to a JSON string */
  headers?: string;
  /** Payload body to include with the request, collapsed to a JSON string */
  body?: string;
};

interface AlterJobModalProps {
  mode?: Modality;
  show?: boolean;
  close: () => void;
  onConfirm: (data: Fields) => Promise<void> | void;
  initialValues?: Fields;
}

const BUTTON_CLASS =
  "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition";

type Modality = "create" | "edit";
type Panels = "basic" | "scheduling" | "data";
type Recurrence = "none" | "cron" | "iso";

export const AlterJobModal: React.FC<AlterJobModalProps> = ({
  mode = "create",
  show = false,
  close,
  onConfirm,
  initialValues,
}) => {
  const { handleSubmit, register, reset, clearErrors, formState } = useForm({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldFocusError: false,
    defaultValues: {
      name: initialValues?.name ?? "",
      enabled: initialValues?.enabled === false ? false : true,
      endpoint: initialValues?.endpoint ?? "",
      runAt: initialValues?.runAt ?? "",
      recuriso: initialValues?.runEvery ?? "",
      headers: initialValues?.headers ?? "",
      body: initialValues?.body ?? "",
    },
  });
  const { value: enabled, toggle: swapEnabled } = useBoolean(true);
  const [panel, setPanel] = useState<Panels>("basic");
  const [now] = useState(DateTime.now());
  const [recurrenceType, updateRecurrence] = useState<Recurrence>("none");
  const [recurCron, setRecurCron] = useState("");
  const [recurDuration, setRecurDuration] = useState(
    initialValues?.runEvery ?? ""
  );

  useEffect(() => {
    const mapping: [Panels, string | undefined][] = [
      ["basic", formState.errors.name?.message],
      ["basic", formState.errors.endpoint?.message],
    ];

    const firstError = mapping.filter((record) => record[1])?.[0];
    if (firstError?.[0]) {
      setPanel(firstError[0]);
    }
  }, [formState]);

  const handleBgTap = useCallback(() => {
    close();
  }, [close]);

  const handleCreate = useCallback(
    (data) => {
      const ifc = <T extends any>(a: T, b: T): T | undefined =>
        typeof a !== "undefined" && a !== b ? a : undefined;

      const runEvery =
        recurrenceType === "none"
          ? ""
          : recurrenceType === "iso"
          ? ifc(recurDuration, initialValues?.runEvery)
          : "";

      onConfirm({
        name: data.name,
        endpoint: data.endpoint,
        enabled: enabled,
        runAt:
          data.runAt !== "" ? ifc(data.runAt, initialValues?.runAt) : undefined,
        runEvery: runEvery,
        headers: ifc(data.headers, initialValues?.headers),
        body: ifc(data.body, initialValues?.body),
      });
    },
    [
      onConfirm,
      enabled,
      initialValues?.runAt,
      initialValues?.runEvery,
      initialValues?.headers,
      initialValues?.body,
      recurrenceType,
      recurDuration,
    ]
  );

  useEffect(() => {
    if (show) {
      clearErrors();
      reset();
      setPanel("basic");
    }
  }, [show, reset, clearErrors]);

  const resolvedInterval = useMemo(() => {
    try {
      if (recurrenceType === "cron" && recurCron) {
        const inter = cronParser.parseExpression(recurCron);
        // discard first next (removes gap between now & first)
        inter.next();
        const next1 = inter.next().toDate();
        const next2 = inter.next().toDate();
        return DateTime.fromJSDate(next2).diff(DateTime.fromJSDate(next1));
      }

      if (recurrenceType === "iso" && recurDuration) {
        return Duration.fromISO(recurDuration);
      }
    } catch (e) {
      // failed parses are null
      return null;
    }

    return null;
  }, [recurrenceType, recurCron, recurDuration]);

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={handleBgTap}
          />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center sm:items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6"
                onSubmit={handleSubmit(handleCreate)}
                as="form"
              >
                <div className="flex flex-row gap-6">
                  <div className="flex flex-col gap-4 text-sm pt-8 flex-shrink-0">
                    <button
                      type="button"
                      className={cx(
                        "flex flex-row items-center rounded-md hover:bg-gray-100 px-3 py-2",
                        panel === "basic" ? "text-brand-500" : "text-gray-500"
                      )}
                      onClick={() => setPanel("basic")}
                    >
                      <AdjustmentsIcon className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline-block">Basic Info</span>
                    </button>
                    <button
                      type="button"
                      className={cx(
                        "flex flex-row items-center rounded-md hover:bg-gray-100 px-3 py-2",
                        panel === "scheduling"
                          ? "text-brand-500"
                          : "text-gray-500"
                      )}
                      onClick={() => setPanel("scheduling")}
                    >
                      <CalendarIcon className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline-block">Scheduling</span>
                    </button>
                    <button
                      type="button"
                      className={cx(
                        "flex flex-row items-center rounded-md hover:bg-gray-100 px-3 py-2",
                        panel === "data" ? "text-brand-500" : "text-gray-500"
                      )}
                      onClick={() => setPanel("data")}
                    >
                      <CodeIcon className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline-block">Job Data</span>
                    </button>
                  </div>
                  <div className="flex-grow">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900 mb-4"
                    >
                      {mode === "create" ? (
                        "Create a job"
                      ) : (
                        <>
                          Edit{" "}
                          <code className="font-mono">
                            {initialValues?.name ?? ""}
                          </code>
                        </>
                      )}
                    </Dialog.Title>
                    <div className="flex flex-row">
                      {/* Basic Settings */}
                      <div
                        className={cx(
                          "flex flex-col gap-6 transition-all w-full",
                          panel === "basic"
                            ? ""
                            : "w-0 opacity-0 overflow-hidden"
                        )}
                      >
                        <fieldset>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 whitespace-nowrap"
                          >
                            Job Name
                            <em
                              className={cx(
                                "text-xs ml-2",
                                formState.errors.name?.message
                                  ? "text-orange-500"
                                  : "text-gray-500"
                              )}
                            >
                              {formState.errors.name?.message ??
                                "A unique name for this Job"}
                            </em>
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="name"
                              className={cx(
                                "shadow-sm block w-full sm:text-sm border-gray-300 rounded-md",
                                mode === "edit" ? "bg-gray-300" : ""
                              )}
                              readOnly={mode === "edit"}
                              {...register("name", {
                                required: "You must specify a job name",
                              })}
                            />
                          </div>
                        </fieldset>
                        <fieldset>
                          <label
                            htmlFor="endpoint"
                            className="block text-sm font-medium text-gray-700 whitespace-nowrap"
                          >
                            Endpoint
                            <em
                              className={cx(
                                "text-xs ml-2",
                                formState.errors.endpoint?.message
                                  ? "text-orange-500"
                                  : "text-gray-500"
                              )}
                            >
                              {formState.errors.endpoint?.message ??
                                "The URL to call when this Job runs"}
                            </em>
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="endpoint"
                              className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder="http://localhost:3000/..."
                              {...register("endpoint", {
                                required: "Every job needs a callable URL",
                                validate: {
                                  routable: (v) => {
                                    try {
                                      const x = new URL(v);
                                      const ok = x.toString().toLowerCase()
                                        ? true
                                        : false;
                                      return (
                                        ok ||
                                        "You must provide a valid URL for this job"
                                      );
                                    } catch (e) {
                                      return "You must provide a valid URL for this job";
                                    }
                                  },
                                },
                              })}
                            />
                          </div>
                        </fieldset>
                        <fieldset>
                          <Switch.Group
                            as="div"
                            className="flex items-center justify-between"
                          >
                            <span className="flex-grow flex flex-col">
                              <Switch.Label
                                as="span"
                                className="text-sm font-medium text-gray-900"
                                passive
                              >
                                Enabled
                              </Switch.Label>
                              <Switch.Description
                                as="span"
                                className="text-sm text-gray-500 italic whitespace-nowrap"
                              >
                                Should this job be enabled?
                              </Switch.Description>
                            </span>
                            <Switch
                              checked={enabled}
                              onChange={swapEnabled}
                              className={cx(
                                enabled ? "bg-brand-600" : "bg-gray-200",
                                "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
                              )}
                            >
                              <span
                                aria-hidden="true"
                                className={cx(
                                  enabled ? "translate-x-5" : "translate-x-0",
                                  "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                                )}
                              />
                            </Switch>
                          </Switch.Group>
                        </fieldset>
                      </div>
                      {/* Scheduling */}
                      <div
                        className={cx(
                          "flex flex-col gap-6 transition-all w-full",
                          panel === "scheduling"
                            ? ""
                            : "w-0 opacity-0 overflow-hidden"
                        )}
                      >
                        <fieldset>
                          <label
                            htmlFor="runAt"
                            className="block text-sm font-medium text-gray-700 whitespace-nowrap"
                          >
                            Run At (optional)
                            <em
                              className={cx(
                                "text-xs ml-2",
                                formState.errors.runAt?.message
                                  ? "text-orange-500"
                                  : "text-gray-500"
                              )}
                            >
                              {formState.errors.runAt?.message ??
                                "When should this Job be executed?"}
                            </em>
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="runAt"
                              className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder={now.startOf("second").toISO({
                                suppressMilliseconds: true,
                              })}
                              {...register("runAt", {
                                required: false,
                                validate: {
                                  ts: (v) => {
                                    if (!v) {
                                      return true;
                                    }

                                    try {
                                      const d = DateTime.fromISO(v);
                                      return (
                                        d.isValid ||
                                        "You must provide a Date/Time in ISO-8601 format"
                                      );
                                    } catch (e) {
                                      return "You must provide a valid ISO-8601 date";
                                    }
                                  },
                                },
                              })}
                            />
                          </div>
                        </fieldset>
                        <fieldset>
                          <span className="block text-sm font-medium text-gray-700 whitespace-nowrap mb-1">
                            Run Every (optional)
                          </span>
                          <div className="mt-1 sm:mt-0 sm:col-span-2">
                            <select
                              id="recur-type"
                              name="recurType"
                              className="max-w-lg block w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                              onChange={(e) =>
                                updateRecurrence(e.target.value as Recurrence)
                              }
                              defaultValue={
                                typeof initialValues?.runEvery === "string" &&
                                initialValues?.runEvery !== ""
                                  ? "iso"
                                  : "none"
                              }
                            >
                              <option value="none">No Recurrence</option>
                              {/* TODO: cron support for runEvery <option value="cron">Simple Cron</option> */}
                              <option value="iso">ISO Duration</option>
                            </select>
                          </div>
                          <div className="h-20 mt-3">
                            <div
                              className={
                                recurrenceType === "none" ? "" : "hidden"
                              }
                            >
                              {/* none */}
                            </div>
                            <div
                              className={cx(
                                "flex flex-col",
                                recurrenceType === "cron" ? "" : "hidden"
                              )}
                            >
                              <input
                                type="text"
                                name="recurcron"
                                id="recurcron"
                                className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="cron expression (ie */2 * * * *)"
                                onChange={(e) => setRecurCron(e.target.value)}
                              />
                              <span className="text-sm text-gray-500 self-end pr-2">
                                {resolvedInterval && resolvedInterval.isValid
                                  ? "Every " +
                                    resolvedInterval
                                      .shiftTo("hours", "minutes", "seconds")
                                      .toHuman()
                                  : null}
                              </span>
                            </div>
                            <div
                              className={cx(
                                "flex flex-col",
                                recurrenceType === "iso" ? "" : "hidden"
                              )}
                            >
                              <input
                                type="text"
                                name="recuriso"
                                id="recuriso"
                                className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="PT3M"
                                onChange={(e) =>
                                  setRecurDuration(e.target.value)
                                }
                                defaultValue={initialValues?.runEvery ?? ""}
                              />
                              <span className="text-sm text-gray-500 self-end pr-2">
                                {resolvedInterval && resolvedInterval.isValid
                                  ? "Every " +
                                    resolvedInterval.toHuman({
                                      listStyle: "long",
                                    })
                                  : null}
                              </span>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                      {/* Job Data */}
                      <div
                        className={cx(
                          "flex flex-col gap-6 transition-all w-full",
                          panel === "data"
                            ? ""
                            : "w-0 opacity-0 overflow-hidden"
                        )}
                      >
                        <fieldset>
                          <label
                            htmlFor="headers"
                            className="block text-sm font-medium text-gray-700 whitespace-nowrap"
                          >
                            Headers (optional)
                            <em className="text-gray-500 text-xs ml-2">
                              Headers to send with this request,{" "}
                              <code className="font-mono">JSON</code> formatted
                            </em>
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="headers"
                              className="shadow-sm block w-full text-sm border-gray-300 rounded-md font-mono"
                              rows={5}
                              placeholder={dedent`
                                {
                                  "x-created-by": "taskless dev server"
                                }
                              `}
                              {...register("headers")}
                            />
                          </div>
                        </fieldset>
                        <fieldset>
                          <label
                            htmlFor="body"
                            className="block text-sm font-medium text-gray-700 whitespace-nowrap"
                          >
                            Job Payload (optional)
                            <em className="text-gray-500 text-xs ml-2">
                              The Job&apos;s data,{" "}
                              <code className="font-mono">JSON</code> formatted
                            </em>
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="body"
                              className="shadow-sm block w-full text-sm border-gray-300 rounded-md font-mono"
                              rows={5}
                              placeholder={dedent`
                                {
                                  "key": "value"
                                }
                              `}
                              {...register("body")}
                            />
                          </div>
                        </fieldset>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="mt-5 pt-5 border-t border-gray-100 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className={cx(
                      BUTTON_CLASS,
                      "bg-brand-700 hover:bg-brand-500 text-white"
                    )}
                  >
                    Create
                  </button>
                  <button
                    className={cx(
                      BUTTON_CLASS,
                      "border-gray-300 text-gray-700 hover:text-gray-500"
                    )}
                    onClick={close}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
