package gocdp

import "encoding/json"

type ffufOutput struct {
	CommandLine string       `json:"commandline"`
	Time        string       `json:"time"`
	Results     []ffufResult `json:"results"`
	Config      interface{}  `json:"config"`
}
type ffufResult struct {
	URL           string `json:"url"`
	Status        int    `json:"status"`
	Redirect      string `json:"redirectlocation"`
	ContentType   string `json:"content-type"`
	ContentLength int    `json:"length"`
}
type FfufParser struct {
}

func (parser FfufParser) Parse(input string) (CDResults, error) {
	var output ffufOutput
	err := json.Unmarshal([]byte(input), &output)
	if err != nil {
		return nil, err
	}

	var results CDResults
	for _, result := range output.Results {
		results = append(results, CDResult{
			Url:           result.URL,
			Status:        result.Status,
			Redirect:      result.Redirect,
			ContentType:   result.ContentType,
			ContentLength: result.ContentLength,
		})
	}
	return results, nil
}

func (parser FfufParser) CanParse(input string) bool {
	var output ffufOutput
	err := json.Unmarshal([]byte(input), &output)
	if err != nil {
		return false
	}

	return output.CommandLine != ""
}

func (parser FfufParser) CanTrim(input string) bool {
	return parser.CanParse(input)
}

func (parser FfufParser) Trim(input string, max int) (string, error) {
	results, err := parser.Parse(input)
	if err != nil {
		return "", err
	}

	var trimCodes []int
	grouped := results.GroupByStatus()
	for code, r := range grouped {
		if len(r) > max {
			trimCodes = append(trimCodes, code)
		}
	}

	if len(trimCodes) == 0 {
		return input, nil
	}

	var output map[string]interface{}
	err = json.Unmarshal([]byte(input), &output)
	if err != nil {
		return "", err
	}

	var trimmedResults []interface{}
	allResults := output["results"].([]interface{})
	for _, c := range trimCodes {
		for _, result := range allResults {
			code := (result.(map[string]interface{}))["status"].(float64)
			if int(code) == c {
				continue
			}

			trimmedResults = append(trimmedResults, result)
		}
	}

	output["results"] = trimmedResults
	bytes, err := json.MarshalIndent(output, "", "  ")
	if err != nil {
		return "", err
	}

	return string(bytes), nil
}
