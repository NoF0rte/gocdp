package gocdp

import (
	"bufio"
	"bytes"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/gocarina/gocsv"
	"github.com/iancoleman/orderedmap"
)

var (
	dirSearchPlainRegex *regexp.Regexp = regexp.MustCompile(`(?m)^(?P<status>[0-9]+)\s*(?P<length>[0-9]+)(?P<units>[^ ]+)\s*(?P<url>[^ ]+)(?:\s*->\s*REDIRECTS TO:\s*(?P<redirect>[^ ]+))?$`)
	dirSearchCSVRegex   *regexp.Regexp = regexp.MustCompile(`(?m)^URL,Status,Size,Content Type,Redirection$`)
)

type dirSearchJSONOutput struct {
	Info struct {
		Args string `json:"args"`
		Time string `json:"time"`
	} `json:"info"`
	Results []dirSearchResult `json:"results"`
}
type dirSearchXMLOutput struct {
	Args    string            `xml:"args,attr"`
	Time    string            `xml:"time,attr"`
	Results []dirSearchResult `xml:"target"`
}
type dirSearchResult struct {
	URL           string `json:"url" csv:"URL" xml:"url,attr"`
	Status        int    `json:"status" csv:"Status" xml:"status"`
	ContentLength int    `json:"content-length" csv:"Size" xml:"contentLength"`
	ContentType   string `json:"content-type" csv:"Content Type" xml:"contentType"`
	Redirect      string `json:"redirect" csv:"Redirection" xml:"redirect,omitempty"`
	raw           interface{}
}

type _dirSearchResult dirSearchResult

func (r *dirSearchResult) UnmarshalJSON(bytes []byte) (err error) {
	foo := _dirSearchResult{}

	if err = json.Unmarshal(bytes, &foo); err == nil {
		*r = dirSearchResult(foo)
	}

	m := orderedmap.New()

	if err = json.Unmarshal(bytes, &m); err == nil {
		r.raw = m
	}

	return err
}

type DirSearchParser struct {
}

func (DirSearchParser) convertLength(length int, units string) int {
	switch strings.ToLower(units) {
	case "kb":
		return length * 1024
	case "mb":
		return length * 1024 * 1024
	case "gb":
		return length * 1024 * 1024 * 1024
	case "tb":
		return length * 1024 * 1024 * 1024 * 1024
	default:
		return length
	}
}

func (DirSearchParser) isPlainResult(input string) bool {
	return dirSearchPlainRegex.MatchString(input)
}

func (DirSearchParser) isJSONResult(input string) bool {
	var output dirSearchJSONOutput
	err := json.Unmarshal([]byte(input), &output)
	if err != nil {
		return false
	}

	return output.Info.Args != ""
}

func (DirSearchParser) isCSVResult(input string) bool {
	return dirSearchCSVRegex.MatchString(input)
}

func (DirSearchParser) isXMLResult(input string) bool {
	var output dirSearchXMLOutput
	err := xml.Unmarshal([]byte(input), &output)
	if err != nil {
		return false
	}

	return output.Args != ""
}

func (DirSearchParser) parseJSON(input string) (CDResults, error) {
	var output dirSearchJSONOutput
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

func (p DirSearchParser) parsePlain(input string) (CDResults, error) {
	var results CDResults
	scanner := bufio.NewScanner(strings.NewReader(input))
	for scanner.Scan() {
		line := scanner.Text()
		match := dirSearchPlainRegex.FindStringSubmatch(line)
		if len(match) == 0 {
			continue
		}

		namedMatches := make(map[string]string)
		for j, name := range dirSearchPlainRegex.SubexpNames() {
			if j != 0 && name != "" {
				namedMatches[name] = match[j]
			}
		}

		status, _ := strconv.Atoi(namedMatches["status"])
		length, _ := strconv.Atoi(namedMatches["length"])

		result := CDResult{
			Url:           namedMatches["url"],
			Status:        status,
			ContentType:   "",
			ContentLength: p.convertLength(length, namedMatches["units"]),
			source:        line,
		}

		if result.IsRedirect() {
			result.Redirect = namedMatches["redirect"]
		}

		results = append(results, result)
	}

	return results, nil
}

func (p DirSearchParser) parseCSV(input string) (CDResults, error) {
	var results CDResults
	var rows []dirSearchResult

	err := gocsv.UnmarshalString(input, &rows)
	if err != nil {
		return nil, err
	}

	for _, result := range rows {
		results = append(results, CDResult{
			Url:           result.URL,
			Status:        result.Status,
			Redirect:      result.Redirect,
			ContentType:   result.ContentType,
			ContentLength: result.ContentLength,
			source:        result,
		})
	}

	return results, nil
}

func (DirSearchParser) parseXML(input string) (CDResults, error) {
	var output dirSearchXMLOutput
	err := xml.Unmarshal([]byte(input), &output)
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
			source:        result,
		})
	}
	return results, nil
}

func (p DirSearchParser) Parse(input string) (CDResults, error) {
	if p.isJSONResult(input) {
		return p.parseJSON(input)
	} else if p.isPlainResult(input) {
		return p.parsePlain(input)
	} else if p.isCSVResult(input) {
		return p.parseCSV(input)
	} else if p.isXMLResult(input) {
		return p.parseXML(input)
	}

	return nil, nil
}

func (p DirSearchParser) CanParse(input string) bool {
	return p.isJSONResult(input) || p.isPlainResult(input) ||
		p.isCSVResult(input) || p.isXMLResult(input)
}

func (p DirSearchParser) CanTransform() bool {
	return true
}

func (p DirSearchParser) transformJSON(input string, filtered []interface{}) (string, error) {
	output := orderedmap.New()
	err := json.Unmarshal([]byte(input), output)
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

func (p DirSearchParser) transformPlain(input string, filtered []interface{}) (string, error) {
	beforeRegex := regexp.MustCompile(`(?m)^#\s*Dirsearch started .*$`)

	writer := bytes.NewBuffer(nil)

	for _, l := range filtered {
		writer.WriteString(fmt.Sprintln(l))
	}

	before := beforeRegex.FindStringIndex(input)[1]

	return fmt.Sprintf("%s\n\n%s", input[0:before], writer.String()), nil
}

func (p DirSearchParser) transformCSV(input string, filtered []interface{}) (string, error) {
	// gocsv cannot marshal a slice of interfaces, they must be structs
	var results []dirSearchResult
	for _, r := range filtered {
		results = append(results, r.(dirSearchResult))
	}

	rows, err := gocsv.MarshalString(&results)
	if err != nil {
		return "", err
	}

	return rows, nil
}

func (p DirSearchParser) transformXML(input string, filtered []interface{}) (string, error) {
	type dirsearchscan dirSearchXMLOutput

	var results []dirSearchResult
	for _, r := range filtered {
		results = append(results, r.(dirSearchResult))
	}

	var output dirsearchscan
	err := xml.Unmarshal([]byte(input), &output)
	if err != nil {
		return "", err
	}

	output.Results = results

	bytes, err := xml.MarshalIndent(output, "", "\t")
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s\n%s\n", `<?xml version="1.0" ?>`, string(bytes)), nil
}

func (p DirSearchParser) Transform(input string, filtered []interface{}) (string, error) {
	if p.isJSONResult(input) {
		return p.transformJSON(input, filtered)
	} else if p.isPlainResult(input) {
		return p.transformPlain(input, filtered)
	} else if p.isCSVResult(input) {
		return p.transformCSV(input, filtered)
	} else if p.isXMLResult(input) {
		return p.transformXML(input, filtered)
	}

	return "", nil
}
