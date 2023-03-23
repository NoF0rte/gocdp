package gocdp

import (
	"encoding/json"

	"github.com/iancoleman/orderedmap"
)

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
	raw           interface{}
}

type _ffufResult ffufResult

func (f *ffufResult) UnmarshalJSON(bytes []byte) (err error) {
	foo := _ffufResult{}

	if err = json.Unmarshal(bytes, &foo); err == nil {
		*f = ffufResult(foo)
	}

	m := orderedmap.New()

	if err = json.Unmarshal(bytes, &m); err == nil {
		f.raw = m
	}

	return err
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
			source:        result.raw,
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

func (parser FfufParser) Trim(input string, opts ...TrimOption) (string, error) {
	results, err := parser.Parse(input)
	if err != nil {
		return "", err
	}

	options := &TrimOptions{
		filters: make([]func(CDResult) bool, 0),
	}

	for _, o := range opts {
		o(options)
	}

	statusCounts := make(map[int]int)

	var filtered []interface{}
	for _, result := range results {
		isFiltered := false
		for _, filter := range options.filters {
			if filter(result) {
				isFiltered = true
				break
			}
		}

		if !isFiltered && options.maxResults > 0 {
			isFiltered = statusCounts[result.Status] >= options.maxResults
		}

		if !isFiltered {
			statusCounts[result.Status] += 1
			filtered = append(filtered, result.source)
		}
	}

	output := orderedmap.New()
	err = json.Unmarshal([]byte(input), output)
	if err != nil {
		return "", err
	}

	output.Set("results", filtered)

	bytes, err := json.MarshalIndent(output, "", "  ")
	if err != nil {
		return "", err
	}

	return string(bytes), nil
}
