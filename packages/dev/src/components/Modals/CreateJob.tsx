import { Dialog } from "@headlessui/react";
import { Duration } from "luxon";
import React, { useCallback, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import cx from "classnames";
import {
  AdjustmentsIcon,
  BeakerIcon,
  CalendarIcon,
  CodeIcon,
} from "@heroicons/react/solid";
import {
  Modal,
  TabButton,
  Region,
  TextInput,
  TextAreaInput,
  SwitchInput,
  SelectInput,
} from "@taskless/ui";

export interface Fields {
  name: string;
  endpoint: string;
  enabled: boolean;
  runAt: string | null;
  runEvery: string | null;
  headers: string | null;
  body: string | null;
  queueName: string;
  appId: string | null;
  appSecret: string | null;
}

interface FormValues {
  name: string;
  endpoint: string;
  enabled: boolean;
  runAt: string;
  runEveryType: "once" | "iso";
  "runEveryType-other": string;
  headers: string;
  body: string;
  queueName: string;
  appId: string;
  appSecret: string;
}

interface CreateJobModalProps {
  show: boolean;
  onRequestClose: () => void;
  onRequestConfirm: (data: Fields) => void;
}

type Tabs = "basic" | "schedule" | "data" | "advanced";

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

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  show,
  onRequestClose,
  onRequestConfirm,
}) => {
  const [activeTab, setActiveTab] = useState<Tabs>("basic");
  const { handleSubmit, register, reset, clearErrors, watch, formState } =
    useForm<FormValues>({
      mode: "onSubmit",
      shouldFocusError: false,
      defaultValues: {
        // basic
        name: "",
        endpoint: "",
        enabled: true,
        // schedule
        runAt: "",
        runEveryType: "once",
        "runEveryType-other": "",
        // data
        headers: "",
        body: "",
        // advanced
        queueName: "",
        appId: "",
        appSecret: "",
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
  const handleCreate = useCallback<SubmitHandler<FormValues>>(
    (d) => {
      onRequestConfirm({
        name: d.name,
        endpoint: d.endpoint,
        enabled: d.enabled,
        runAt: d.runAt,
        runEvery: d.runEveryType === "once" ? "" : d["runEveryType-other"],
        headers: d.headers,
        body: d.body,
        queueName: d.queueName,
        appId: d.appId,
        appSecret: d.appSecret,
      });
    },
    [onRequestConfirm]
  );

  useEffect(() => {
    console.log(watchRunEveryType);
  }, [watchRunEveryType]);

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
      <form onSubmit={() => void handleSubmit(handleCreate)} autoComplete="off">
        <div className="flex flex-row gap-6">
          <div className="flex flex-col gap-4 text-sm pt-8 flex-shrink-0">
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
          </div>
          <div className="flex flex-col w-full">
            <Dialog.Title>Create a Job</Dialog.Title>
            <div className="flex flex-row">
              <Region
                active={activeTab === "basic"}
                className="gap-6 w-0 opacity-0 overflow-hidden transition-all flex flex-col gap-6"
                activeClassName="!w-full !opacity-100"
              >
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
                <SwitchInput
                  id="enabled"
                  label="Enabled"
                  description="Should this job be enabled?"
                  props={register("enabled")}
                />
              </Region>
              <Region
                active={activeTab === "schedule"}
                className="gap-6 w-0 opacity-0 overflow-hidden transition-all flex flex-col gap-6"
                activeClassName="!w-full !opacity-100"
              >
                <TextInput
                  id="runAt"
                  label="Run at"
                  description="When should this Job be executed?"
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
                    <span className="text-sm text-gray-500 self-end pr-2">
                      {resolvedInterval && resolvedInterval.isValid
                        ? "Every " +
                          resolvedInterval.toHuman({
                            listStyle: "long",
                          })
                        : null}
                    </span>
                  </div>
                ) : null}
              </Region>
              <Region
                active={activeTab === "data"}
                className="gap-6 w-0 opacity-0 overflow-hidden transition-all flex flex-col gap-6"
                activeClassName="!w-full !opacity-100"
              >
                <TextAreaInput
                  id="headers"
                  label="Headers"
                  description={
                    <>
                      Headers to send with this request,{" "}
                      <code className="not-italic font-mono">JSON</code>{" "}
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
              </Region>
              <Region
                active={activeTab === "advanced"}
                className="gap-6 w-0 opacity-0 overflow-hidden transition-all flex flex-col gap-6"
                activeClassName="!w-full !opacity-100"
              >
                <TextInput
                  id="queueName"
                  label="Alternate Queue Name"
                  description="Select a queue name other than the default for grouping and searching"
                  props={register("queueName")}
                />
                <TextInput
                  id="search-appId"
                  label="Application ID"
                  description="Your application ID, or blank to use the development default"
                  props={register("appId")}
                />
                <TextInput
                  id="search-appSecret"
                  label="Application Secret"
                  description={
                    <>
                      Your application secret, should match{" "}
                      <code className="not-italic font-mono">
                        TASKLESS_APP_SECRET
                      </code>{" "}
                      for signing
                    </>
                  }
                  props={register("appSecret")}
                />
              </Region>
            </div>
          </div>
        </div>
        <Modal.Actions>
          <button
            type="submit"
            className={cx(
              "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition",
              "bg-primary-700 hover:bg-primary-500 text-white"
            )}
          >
            Create
          </button>
          <button
            className={cx(
              "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition",
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
