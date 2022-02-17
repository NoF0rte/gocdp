package gocdp

import (
	"sort"
	"strings"
)

var statusCodeGroups = []int{
	100,
	200,
	300,
	400,
	500,
}

type CdOutput struct {
	Results []CDResult
	Config  interface{}
}

type CDResults []CDResult

func (results CDResults) GroupByStatus() map[int][]CDResult {
	grouped := make(map[int][]CDResult)
	for _, result := range results {
		var status int
		for i, code := range statusCodeGroups {
			if i == len(statusCodeGroups)-1 {
				status = code
				break
			}

			if result.Status >= code && result.Status < statusCodeGroups[i+1] {
				status = code
				break
			}
		}
		grouped[status] = append(grouped[status], result)
	}

	for _, group := range grouped {
		sort.Slice(group, func(i, j int) bool {
			first := group[i]
			second := group[j]
			if first.Status == second.Status {
				return strings.Compare(first.Url, second.Url) > 1
			}
			return first.Status < second.Status
		})
	}
	return grouped
}

type CDResult struct {
	Url           string
	Status        int
	Redirect      string
	ContentType   string
	ContentLength int
}

func (result CDResult) IsRedirect() bool {
	return result.Redirect != "" || (result.Status >= 300 && result.Status < 400)
}
func (result CDResult) IsSuccess() bool {
	return result.Status >= 200 && result.Status < 300
}
func (result CDResult) IsError() bool {
	return result.Status >= 400
}
func (result CDResult) IsAuthError() bool {
	return result.Status == 401 || result.Status == 403
}
func (result CDResult) IsRateLimit() bool {
	return result.Status == 429
}

type FfufConfig struct {
}

type GobusterConfig struct {
}
