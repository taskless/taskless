import { DateTime, Duration } from "luxon";
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import cx from "classnames";
import {
  AdjustmentsIcon,
  BeakerIcon,
  CalendarIcon,
  CodeIcon,
  DocumentTextIcon,
} from "@heroicons/react/solid";
import {
  Modal,
  TabButton,
  TextInput,
  TextAreaInput,
  SwitchInput,
  SelectInput,
} from "@taskless/ui";
import { Transition } from "@headlessui/react";

export interface Fields {
  name: string;
  endpoint: string;
  enabled: boolean;
  retries: string;
  runAt: string | null;
  runEvery: string | null;
  headers: string | null;
  body: string | null;
  timezone: string | null;
  secret: string | null;
}

interface FormValues {
  name: string;
  endpoint: string;
  enabled: boolean;
  retries: string;
  runAt: string;
  runEveryType: "once" | "iso";
  "runEveryType-other": string;
  headers: string;
  body: string;
  secret: string;
  timezone: string;
}

interface CreateJobModalProps {
  show: boolean;
  onRequestClose: () => void;
  onRequestConfirm: (data: Fields) => void;
}

type Tabs = "basic" | "schedule" | "data" | "advanced" | "examples";

const isJSON = (msg: string) => (v: string) => {
  if (!v || v === "") {
    return true;
  }
  try {
    JSON.parse(v);
    return true;
  } catch (e) {
    return msg ?? "Value must be valid JSON";
  }
};

const DialogSection: React.FC<PropsWithChildren<{ active: boolean }>> = ({
  children,
  active,
}) => (
  <Transition
    show={active}
    unmount={false}
    enter="transition-all duration-150"
    enterFrom="opacity-0 -translate-x-full"
    enterTo="opacity-100 translate-x-0 z-10"
    leave="transition-all duration-150"
    leaveFrom="opacity-100 translate-x-0"
    leaveTo="opacity-0 -translate-x-full z-0"
    className="w-full"
  >
    {children}
  </Transition>
);

const Example: React.FC<{
  title: string;
  details: string | JSX.Element;
  onClick: () => void;
}> = ({ title, details, onClick }) => (
  <div className="flex flex-row items-center">
    <p className="flex-grow pr-4">
      <strong>{title}</strong>
      <br />
      {details}
    </p>
    <button
      type="button"
      onClick={onClick}
      className="border-primary-500 hover:bg-primary-500/10 rounded border bg-white px-2 py-1 transition-all"
    >
      use
    </button>
  </div>
);

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  show,
  onRequestClose,
  onRequestConfirm,
}) => {
  const [activeTab, setActiveTab] = useState<Tabs>("basic");
  const {
    handleSubmit,
    register,
    reset,
    clearErrors,
    watch,
    setValue,
    formState,
  } = useForm<FormValues>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldFocusError: false,
    defaultValues: {
      // basic
      name: "",
      endpoint: "",
      retries: "0",
      enabled: true,
      // schedule
      runAt: "",
      runEveryType: "once",
      "runEveryType-other": "",
      // data
      headers: "",
      body: "",
      // advanced
      timezone: DateTime.local().toFormat("z"),
      secret: "",
    },
  });

  const [resolvedInterval, setResolvedInterval] = useState(
    Duration.fromISO("invalid")
  );
  const watchRunEveryType = watch("runEveryType");
  const watchRunEveryTypeOther = watch("runEveryType-other");
  useEffect(() => {
    if (watchRunEveryType === "iso") {
      const d = Duration.fromISO(watchRunEveryTypeOther);
      if (d.isValid && (d.shiftTo("seconds").toObject()?.seconds ?? 0) > 0) {
        setResolvedInterval(d);
      } else {
        setResolvedInterval(Duration.fromISO("invalid"));
      }
    }
  }, [watchRunEveryType, watchRunEveryTypeOther]);

  // convert react-hook-form into payload
  const handleCreate = handleSubmit(
    useCallback(
      (d) => {
        onRequestConfirm({
          name: d.name,
          endpoint: d.endpoint,
          enabled: d.enabled,
          runAt: d.runAt,
          runEvery: d.runEveryType === "once" ? "" : d["runEveryType-other"],
          headers: d.headers,
          body: d.body,
          timezone: d.timezone,
          secret: d.secret,
          retries: d.retries,
        });
      },
      [onRequestConfirm]
    )
  );

  useEffect(() => {
    if (show) {
      clearErrors();
      reset();
    }
  }, [show, clearErrors, reset]);

  useEffect(() => {
    if (
      (formState.errors.name || formState.errors.endpoint) &&
      activeTab !== "basic"
    ) {
      setActiveTab("basic");
    } else if (
      formState.errors.runAt ||
      (formState.errors["runEveryType-other"] && activeTab !== "schedule")
    ) {
      setActiveTab("schedule");
    }
  }, [activeTab, formState]);

  return (
    <Modal show={show} closeOnTapOutside onRequestClose={onRequestClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate().catch((err) => {
            console.error(err);
          });
        }}
        autoComplete="off"
      >
        <div className="flex flex-row gap-6">
          <div className="z-20 flex flex-shrink-0 flex-col gap-4 pt-8 text-sm">
            <TabButton
              active={activeTab === "basic"}
              label="Basic Info"
              labelClassName="hidden md:block"
              icon={AdjustmentsIcon}
              onClick={() => setActiveTab("basic")}
            />
            <TabButton
              active={activeTab === "schedule"}
              label="Scheduling"
              labelClassName="hidden md:block"
              icon={CalendarIcon}
              onClick={() => setActiveTab("schedule")}
            />
            <TabButton
              active={activeTab === "data"}
              label="Data"
              labelClassName="hidden md:block"
              icon={CodeIcon}
              onClick={() => setActiveTab("data")}
            />
            <TabButton
              active={activeTab === "advanced"}
              label="Advanced"
              labelClassName="hidden md:block"
              icon={BeakerIcon}
              onClick={() => setActiveTab("advanced")}
            />
            <TabButton
              active={activeTab === "examples"}
              label="Examples"
              labelClassName="hidden md:block"
              icon={DocumentTextIcon}
              onClick={() => setActiveTab("examples")}
            />
          </div>
          <div className="flex w-full flex-col overflow-hidden">
            <Modal.Title>Create a Job</Modal.Title>
            <div className="flex flex-row pt-3">
              <DialogSection active={activeTab === "basic"}>
                <TextInput
                  id="name"
                  label="Job name"
                  description="A unique name for this Job"
                  error={formState.errors.name?.message}
                  props={register("name", {
                    required: "You must provide a name for the job",
                  })}
                />
                <TextInput
                  id="endpoint"
                  label="Endpoint"
                  description="A fully qualified URL that Taskless should call"
                  error={formState.errors.endpoint?.message}
                  props={register("endpoint", {
                    required: "You must provide a URL to call",
                    validate: {
                      routable: (v) => {
                        try {
                          const x = new URL(v);
                          const ok = x.toString().toLowerCase() ? true : false;
                          return (
                            ok || "You must provide a valid URL for this job"
                          );
                        } catch (e) {
                          return "You must provide a valid URL for this job";
                        }
                      },
                    },
                  })}
                />
                <TextInput
                  id="retries"
                  label="Retries"
                  description="Number of times to retry this job"
                  error={formState.errors.retries?.message}
                  props={register("retries", {
                    validate: {
                      isNumber: (v) => {
                        return (
                          /^[\d]+$/.test(`${v}`) ||
                          "Must provide a numeric value"
                        );
                      },
                    },
                  })}
                />
                <SwitchInput
                  id="enabled"
                  label="Enabled"
                  description="Should this job be enabled?"
                  props={register("enabled")}
                />
              </DialogSection>
              <DialogSection active={activeTab === "schedule"}>
                <TextInput
                  id="runAt"
                  label="Run at"
                  description="When should this Job be executed? Leave blank to run immediately"
                  error={formState.errors.runAt?.message}
                  props={register("runAt")}
                />
                <SelectInput
                  id="runEveryType"
                  label="Run every"
                  description="How often should the Job run?"
                  options={[
                    { label: "Run only once", value: "once" },
                    { label: "ISO-8601 Duration", value: "iso" },
                  ]}
                  props={register("runEveryType")}
                />
                {watchRunEveryType === "iso" ? (
                  <div className="flex flex-col">
                    <TextInput
                      id="runEveryType-other"
                      props={register("runEveryType-other", {
                        shouldUnregister: true,
                      })}
                      error={formState.errors["runEveryType-other"]?.message}
                    />
                    <span className="self-end pr-2 text-sm text-gray-500">
                      {resolvedInterval && resolvedInterval.isValid
                        ? "Every " +
                          resolvedInterval.toHuman({
                            listStyle: "long",
                          })
                        : null}
                    </span>
                  </div>
                ) : null}
              </DialogSection>
              <DialogSection active={activeTab === "data"}>
                <TextAreaInput
                  id="headers"
                  label="Headers"
                  description={
                    <>
                      Headers to send with this request,{" "}
                      <code className="font-mono not-italic">JSON</code>{" "}
                      formatted
                    </>
                  }
                  error={formState.errors.headers?.message}
                  props={register("headers", {
                    validate: {
                      isJSON: isJSON("You must provide valid JSON for headers"),
                    },
                  })}
                />
                <TextAreaInput
                  id="body"
                  label="Body"
                  description="The Job data to include"
                  error={formState.errors.body?.message}
                  props={register("body", {
                    validate: {
                      isJSON: isJSON(
                        "You must provide valid JSON for the body"
                      ),
                    },
                  })}
                />
              </DialogSection>
              <DialogSection active={activeTab === "advanced"}>
                <TextInput
                  id="tz"
                  label="Timezone"
                  description={
                    "Specify a timezone used in runEvery calculations"
                  }
                  props={{
                    ...register("timezone"),
                    placeholder: DateTime.local().toFormat("z"),
                  }}
                />
                <TextInput
                  id="secret"
                  label="Project Secret"
                  description={
                    <>
                      To sign your requests in development, provide the value
                      matching your project&apos;s{" "}
                      <code className="font-mono not-italic">
                        TASKLESS_SECRET
                      </code>{" "}
                      value.
                    </>
                  }
                  props={register("secret")}
                />
              </DialogSection>
              <DialogSection active={activeTab === "examples"}>
                <p className="text-sm">
                  Sample Taskless Jobs to get you started. Selecting a template
                  will pre-fill all of the job arguments, showing the different
                  ways Taskless jobs can be configured. By default, jobs point
                  to Taskless&apos; own local echo endpoint.
                </p>
                <div className="flex flex-col gap-6 pt-4 text-sm">
                  <Example
                    title="Immediate"
                    details={
                      <>
                        A job that runs immediately, by setting{" "}
                        <code>runAt</code> to an empty value
                      </>
                    }
                    onClick={() => {
                      setValue(
                        "body",
                        JSON.stringify(
                          { message: "A sample run-immediate message" },
                          null,
                          2
                        )
                      );
                      setValue("enabled", true);
                      setValue(
                        "endpoint",
                        "http://localhost:3001/api/queues/tds"
                      );
                      setValue(
                        "headers",
                        JSON.stringify(
                          {
                            "content-type": "application/json",
                          },
                          null,
                          2
                        )
                      );
                      setValue("name", "run-immediate-example");
                      setValue("retries", "0");
                      setValue("runAt", "");
                      setValue("runEveryType", "once");
                      setValue("runEveryType-other", "");
                      setValue("secret", "");
                      setValue("timezone", DateTime.local().toFormat("z"));
                      setActiveTab("basic");
                    }}
                  />
                  <Example
                    title="Delayed"
                    details={
                      <>
                        A job that runs in 10 minutes from now, by setting{" "}
                        <code>runAt</code> to an ISO-8601 value 10 minutes into
                        the future
                      </>
                    }
                    onClick={() => {
                      setValue(
                        "body",
                        JSON.stringify(
                          { message: "A sample run-delayed message" },
                          null,
                          2
                        )
                      );
                      setValue("enabled", true);
                      setValue(
                        "endpoint",
                        "http://localhost:3001/api/queues/tds"
                      );
                      setValue(
                        "headers",
                        JSON.stringify(
                          {
                            "content-type": "application/json",
                          },
                          null,
                          2
                        )
                      );
                      setValue("name", "run-delayed-example");
                      setValue("retries", "0");
                      setValue(
                        "runAt",
                        DateTime.now().plus({ minutes: 10 }).toISO()
                      );
                      setValue("runEveryType", "once");
                      setValue("runEveryType-other", "");
                      setValue("secret", "");
                      setValue("timezone", DateTime.local().toFormat("z"));
                      setActiveTab("basic");
                    }}
                  />
                  <Example
                    title="Recurring ISO-8601"
                    details={
                      <>
                        A job that will run immediately, and then again in 10
                        minute incrments, by setting the <code>runEvery</code>{" "}
                        value to a 10 minute ISO-8601 duration
                      </>
                    }
                    onClick={() => {
                      setValue(
                        "body",
                        JSON.stringify(
                          { message: "A sample run-repeating message" },
                          null,
                          2
                        )
                      );
                      setValue("enabled", true);
                      setValue(
                        "endpoint",
                        "http://localhost:3001/api/queues/tds"
                      );
                      setValue(
                        "headers",
                        JSON.stringify(
                          {
                            "content-type": "application/json",
                          },
                          null,
                          2
                        )
                      );
                      setValue("name", "run-repeating-example");
                      setValue("retries", "0");
                      setValue(
                        "runAt",
                        DateTime.now().plus({ minutes: 10 }).toISO()
                      );
                      setValue("runEveryType", "iso");
                      setValue("runEveryType-other", "PT10M");
                      setValue("secret", "");
                      setValue("timezone", DateTime.local().toFormat("z"));
                      setActiveTab("basic");
                    }}
                  />
                </div>
              </DialogSection>
            </div>
          </div>
        </div>
        <Modal.Actions>
          <button
            type="submit"
            className={cx(
              "inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium shadow-sm transition focus:outline-none sm:ml-3 sm:w-auto sm:text-sm",
              "bg-primary-700 hover:bg-primary-500 text-white"
            )}
          >
            Create
          </button>
          <button
            className={cx(
              "inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium shadow-sm transition focus:outline-none sm:ml-3 sm:w-auto sm:text-sm",
              "border-gray-300 text-gray-700 hover:text-gray-500"
            )}
            onClick={onRequestClose}
          >
            Cancel
          </button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};
