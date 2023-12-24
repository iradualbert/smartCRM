import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ImportTemplate from "@/components/ImportTemplate";
import { FormControl, Input, InputAdornment, Button, InputLabel, FormGroup, FormControlLabel, Switch, Typography, Chip } from "@mui/material";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ImAttachment } from "react-icons/im";
import { MdOutlineSchedule } from "react-icons/md";
import { createBulkEmail, createEmail } from "@/lib/api";
import { getCurrentDateTime, getUpdatedParams } from "@/lib/utils";
import { TemplateType } from "../../components/forms/MailTemplateForm";
import { TemplateParameter } from "@/lib/types";
import ParameterInput from "../../components/forms/ParameterInput";
import RecipientsTable from "../../components/RecipientTable";
import { useEmailSignature, useToasts } from "@/lib/hooks";


const NewMailPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [attachments, setAttachments] = useState(new Set());
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [CC, setCC] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [isSendLater, setIsSendLater] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [isScheduleDisabled, setIsScheduleDisabled] = useState(false);
  const [templateParameters, setTemplateParameters] = useState<TemplateParameter[]>([]);
  const [paramDefaultValues, setParamDefaultValues] = useState({});
  const [gridRows, setGridRows] = useState<object[]>([]);
  
  // DOM ELEMENTs refs
  const attachInputRef = useRef();
  const timer = useRef();

  // custom 
  const mailSignature = useEmailSignature();
  const isBulk = searchParams.get('type') ==="multiple";
  const { showToast } = useToasts();

  useEffect(() => {
    if (mailSignature.signature) {
      setMailBody(current => `${current}<br><br><br><br><br>${mailSignature.signature}`)
    }
    
  }, [mailSignature.signature])

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current as number);
    }
    timer.current = setTimeout(() => {
      setTemplateParameters(current => {
        const { params } = getUpdatedParams(to + CC + subject + mailBody, current);
        showToast({
          message: subject,
          severity: "success"
        })
        return params
      });
    }, 1000)
    return () => clearTimeout(timer.current)

  }, [to, CC, subject, mailBody])

  useEffect(() => {
    setGridRows(currentRows => {
      return currentRows.map(row => {
        const _row = {}
        templateParameters.forEach(param => {
          _row[param.name] = row[param.name] || { currentValue: "", willUseDefaultValue: false }
        })
        return _row
      })
    })
  }, [templateParameters])


  useEffect(() => {
    if (!isBulk) return;
    if (!to) setTo(`{{ email }}`);
    if (!subject) setSubject(`{{ subject }}`)
  }, [isBulk])

  const handleMailPreview = () => { }

  const handleOnTemplateSelect = (template: TemplateType) => {
    setSubject(template.subject)
    setMailBody(template.body as string)
    setTemplateParameters(template.parameters)
  }



  const handleSubmit = (e: any) => {
    e.preventDefault();
    const data = {
      to,
      cc: CC,
      body: mailBody,
      subject,
    }
    if (isSendLater && scheduleAt) {
      data.schedule_datetime = scheduleAt
    }

    const formData = new FormData();
    formData.append("to", to);
    formData.append("cc", CC);
    formData.append("body", mailBody);
    formData.append("subject", subject);
    if (isSendLater && scheduleAt) {
      formData.append("schedule_datetime", scheduleAt);
    }
    attachments.forEach(attach => {
      formData.append("attachment", attach);
    });
    createEmail(formData);

  }

  const handleSendAllClick = (e) => {
    e.preventDefault();
    if (gridRows.length <= 0) {
      alert("Add at least one row");
      return
    }
    const formData = new FormData();
    const mailTemplate = { to, cc: CC, body: mailBody, subject }
    if (isSendLater && scheduleAt) {
      mailTemplate["schedule_datetime"] = scheduleAt;
    }
    formData.append("template", JSON.stringify(mailTemplate));

    attachments.forEach(attach => {
      formData.append("attachment", attach);
    });
    formData.append("mailRows", JSON.stringify(gridRows));
    const parameters = {}
    templateParameters.forEach(param => {
      parameters[param.name] = paramDefaultValues[param.name] === undefined ? param.defaultValue : paramDefaultValues[param.name]
    })
    formData.append("paramDefaultValues", JSON.stringify(parameters))
    createBulkEmail(formData);

  }

  const handleAttachClick = () => {
    attachInputRef.current.click();
  }


  const handleAddAttach = (e) => {
    setAttachments((prev) => new Set([...prev, ...e.target.files]));
  };

  const handleRemoveAttach = (index) => {
    setAttachments((prev) => {
      const newFiles = new Set([...prev]);

      // Convert set to an array, remove the file at the specified index, and convert back to a set
      const filesArray = Array.from(newFiles);
      filesArray.splice(index, 1);
      const updatedFilesSet = new Set(filesArray);

      return updatedFilesSet;
    });
  };

  const updateParameterDefaultValue = (e, idx) => {
    setTemplateParameters(currentParams => {
      const _currentParams = [...currentParams]
      _currentParams[idx].defaultValue = e.target.value;
      return _currentParams
    })
    setParamDefaultValues(current => ({
      ...current,
      [e.target.name]: e.target.value
    }))
  }

  const handleAddRow = () => {
    const row = {}
    templateParameters.forEach(param => {
      row[param.name] = {
        currentValue: "", //paramDefaultValues[param.name] || param.defaultValue,
        willUseDefaultValue: false,
      }
    })
    setGridRows(current => [...current, row])
  }

  const handleRemoveRow = (removeAt: number) => {
    setGridRows(currentRows => {
      const newRows = [...currentRows];
      newRows.splice(removeAt, 1)
      return newRows
    })
  }

  const handleRowInputChange = (e, rowIndex) => {
    setGridRows(currentRows => {
      const newRows = [...currentRows];
      const updatedRow = newRows[rowIndex];
      newRows[rowIndex] = {
        ...updatedRow,
        [e.target.name]: {
          currentValue: e.target.value,
          willUseDefaultValue: false,
        }
      }
      return newRows
    })
  }

  const handleRowInputToggleUseDefaultValue = (paramName, rowIndex) => {
    setGridRows(currentRows => {
      const newRows = [...currentRows];
      const updatedRow = newRows[rowIndex];
      let willUseDefaultValue = true;
      let currentValue = paramDefaultValues[paramName];
      try {
        willUseDefaultValue = !updatedRow[paramName].willUseDefaultValue;
        currentValue = willUseDefaultValue ? paramDefaultValues[paramName] : updatedRow[paramName].currentValue;
      } catch (err) {
        console.error(err)
      }

      console.log(updatedRow)

      newRows[rowIndex] = {
        ...updatedRow,
        [paramName]: {
          currentValue: currentValue || "",
          willUseDefaultValue,
        }
      }
      return newRows
    })
  }


  return (
    <section className="bg-primary-50 bg-dotted-pattern bg-center bg-cover py-2  md:py-3">
      <Typography variant="h5" marginBottom={3}>Send & Schedule Email</Typography>
      <ImportTemplate onSelect={handleOnTemplateSelect} />
      <form onSubmit={handleSubmit} className="flex md:gap-x-32 gap-10 py-5 md:py-6 flex-wrap">
        <div className="flex gap-4 mt-5 fixed bottom-0 left-20 pt-3 w-[calc(100%-5rem)] pr-4 pb-6 bg-slate-50 border-t-2 z-10 justify-between">
          <div className="flex gap-4" >
            <Chip onClick={() => setSearchParams({ type: 'single' })} label="Send Single Mail" color={isBulk ? "default" : "primary"} clickable />
            <Chip onClick={() => setSearchParams({ type: 'multiple' })} label="Multiple Emails" color={isBulk ? "primary" : "default"} clickable />
          </div>
          <FormGroup row>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <MdOutlineSchedule size={26} />
                <InputLabel>Send At:</InputLabel>
                <input
                  value={scheduleAt}
                  disabled={isScheduleDisabled}
                  onChange={(e) => {
                    setScheduleAt(e.target.value);
                    if (e.target.value) setIsSendLater(true);
                  }}
                  className="outline-none" type="datetime-local"
                  min={getCurrentDateTime()}
                />
              </div>
              {isBulk && (<Typography variant="caption">
                All Emails without custom Schedule Time will be sent at this time.
              </Typography>)}

            </div>
            <FormControlLabel
              value="Send Now"
              control={<Switch color="primary" checked={!isSendLater} />}
              label="Send Now"
              labelPlacement="start"
              onChange={e => {
                setIsSendLater(!e.target.checked);
                setIsScheduleDisabled(e.target.checked);
              }}
            />
          </FormGroup>
          <Button
            type="submit"
            variant="contained"
          >
            {isSendLater && scheduleAt ? "Schedule" : "Send Now"}
          </Button>
        </div>
        <div className="flex flex-col gap-4 md:w-1/2">
          <FormControl fullWidth>
            <Input
              size="small"
              value={to}
              onChange={e => setTo(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <InputLabel>To: </InputLabel>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl fullWidth>
            <Input
              value={CC}
              onChange={e => setCC(e.target.value)}
              size="small"
              startAdornment={
                <InputAdornment position="start">
                  <InputLabel>CC:</InputLabel>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl fullWidth>
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              size="small"
              placeholder="Subject"

            />
          </FormControl>

          <ReactQuill
            value={mailBody}
            onChange={setMailBody}
            placeholder="Start typing......"
            className="mb-12 min-h-20"
          />
          <div className="flex flex-col items-start py-2 gap-2">
            <Button startIcon={<ImAttachment />} onClick={handleAttachClick}>Attachments</Button>
            <div className="py-4 w-full px-2 rounded-md border">
              <input hidden type="file" onChange={handleAddAttach} multiple ref={attachInputRef} />
              {attachments &&
                <div className="flex gap-3 flex-wrap">
                  {Array.from(attachments).map(
                    (file, idx) => <Chip key={idx} label={file.name} onDelete={() => handleRemoveAttach(idx)} />)}
                </div>

              }
            </div>
            <Button onClick={handleAttachClick} style={{ marginLeft: "auto" }} variant="outlined" size="small">+ Add</Button>
          </div>
        </div>

        {templateParameters.length > 0 && (
          <div className="flex flex-col border-2 p-5 rounded-md self-start">

            <Typography variant="h6">Parameters</Typography>
            {templateParameters.map((param, idx) => (
              <ParameterInput
                onChange={e => updateParameterDefaultValue(e, idx)}
                key={idx}
                param={param}
                value={paramDefaultValues[param.name]}
              />
            ))
            }
          </div>
        )}
        {isBulk && (
          <>
            <RecipientsTable
              onAddRow={handleAddRow}
              onRemoveRow={handleRemoveRow}
              rows={gridRows}
              parameters={templateParameters}
              onRowInputChange={handleRowInputChange}
              onRowInputUseDefaultValueChange={handleRowInputToggleUseDefaultValue}
            />
            <Button variant="contained" onClick={handleSendAllClick}>Send All</Button>
          </>
        )}

      </form>
    </section>
  )
}


export default NewMailPage;